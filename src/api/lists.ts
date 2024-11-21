import { BOOK_READ_STATUS, SIMPLE_BOOK_FIELDS, USERNAME } from '../utils/constants';
import { transformBooks } from '../utils/transformBooks';
import { HardcoverList, SimpleBook, SimpleHardcoverBook } from '../utils/types';
import { fetchGraphQL } from './fetchEndpoint';

export async function getLists(): Promise<HardcoverList[]> {
    const operation = `
        query GetLists {
            me {
                username
                lists(order_by: { created_at: desc }) {
                	id
                	name
                    description
                    slug
                    books_count
                }
            }
        }
    `;

    try {
        const response = await fetchGraphQL(operation);
        return response?.data?.me[0].lists;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch lists');
    }
}

export async function getListBooks(listId: number): Promise<SimpleBook[]> {
    const operation = `
        query GetListBooks {
            me {
                lists(where: { id: { _eq: ${listId} } }) {
                    list_books(order_by: { date_added: desc }) {
                        book {
                            ${SIMPLE_BOOK_FIELDS}
                        }
                    }
                }
            }
        }
    `;

    type ListBook = {
        book: SimpleHardcoverBook
    };

    try {
        const response = await fetchGraphQL(operation);
        const listBooks: ListBook[] = response?.data?.me[0].lists[0].list_books || [];
        const hardcoverBooks: SimpleHardcoverBook[] = listBooks.map((listBook) => listBook.book);
        return transformBooks(hardcoverBooks);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch list books');
    }
}

export async function addBookToList(bookId: number, listId: number) {
    const operation = `
        mutation AddBookToList {
            insert_list_book(object: { book_id: ${bookId}, list_id: ${listId} }) {
                id
            }
        }
    `;

    return fetchGraphQL(operation);
}

export async function removeBookFromList(bookId: number, listId: number) {
    const getListBookIdOperation = `
        query GetListBookId {
            me {
                lists(
                    where: { id: { _eq: ${listId} } }
                ) {
                    list_books(
                        where: { book_id: { _eq: ${bookId} } }
                    ) {
                        id
                    }
                }
            }
        }
    `;

    try {
        const response = await fetchGraphQL(getListBookIdOperation);
        const listBookId = response?.data?.me[0].lists[0].list_books[0].id;

        if (!listBookId) {
            throw new Error('List book not found');
        }

        const removeBookFromListOperation = `
            mutation RemoveBookFromList {
                delete_list_book(id: ${listBookId}) {
                    id
                }
            }
        `;

        return fetchGraphQL(removeBookFromListOperation);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to remove book from list');
    }
}

export async function getBooksByStatus(statusId: number): Promise<SimpleBook[]> {
    const operation = `
        query GetBooksByStatus {
            me {
                user_books(
                    where: { status_id: { _eq: ${statusId} } }
                    order_by: { updated_at: desc }
                ) {
                    book {
                        ${SIMPLE_BOOK_FIELDS}
                    }
                }
            }
        }
    `;

    type UserBook = {
        book: SimpleHardcoverBook
    };

    try {
        const response = await fetchGraphQL(operation);
        const userBooks: UserBook[] = response?.data?.me[0].user_books || [];
        const hardcoverBooks: SimpleHardcoverBook[] = userBooks.map((userBook) => userBook.book);
        return transformBooks(hardcoverBooks);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user books');
    }
}

export async function getUserBooks(): Promise<{
    wantToRead: number,
    currentlyReading: number,
    read: number,
    didNotFinish: number 
}> {
    const operation = `
        query GetUserBooks {
            me {
                user_books {
                    status_id
                }
            }
        }
    `;

    type UserBook = {
        status_id: number,
    };

    try {
        const response = await fetchGraphQL(operation);
        const userBooks: UserBook[] = response?.data?.me[0].user_books || [];

        const wantToRead = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.WANT_TO_READ)
            .length;
        
        const currentlyReading = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.CURRENTLY_READING)
            .length;

        const read = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.READ)
            .length;

        const didNotFinish = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.DID_NOT_FINISH)
            .length;

        return { wantToRead, currentlyReading, read, didNotFinish };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user books');
    }
}

export async function changeBookReadStatus(bookId: number, statusId: number) {
    /* 
    Status IDs:
     1: Want to Read
     2: Currently Reading
     3: Read
     5: Did Not Finish
    */
    const operation = `
        mutation ChangeBookReadStatus {
            insert_user_book(object: { book_id: ${bookId}, status_id: ${statusId} }) {
                id
            }
        }
    `;

    return fetchGraphQL(operation);
}

export async function removeBookReadStatus(bookId: number) {
    const getUserBookOperation = `
        query GetUserBookByBookId {
            user_books(
                where: {_and: [
                    { user: { username: { _eq: "${USERNAME}" } } },
                    { book_id: { _eq: ${bookId} } }
                ]}
            ) {
                id
            }
        }
    `;

    try {
        const response = await fetchGraphQL(getUserBookOperation);
        const userBookId: number = response?.data?.user_books[0].id;
        if (!userBookId) throw new Error('User book not found');

        const removeUserBookOperation = `
            mutation RemoveUserBook {
                delete_user_book(id: ${userBookId}) {
                    id
                }
            }
        `;

        return fetchGraphQL(removeUserBookOperation);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to remove user book');
    }
}