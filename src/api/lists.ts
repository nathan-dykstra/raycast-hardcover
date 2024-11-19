import { BOOK_FIELDS_TO_RETURN, BOOK_READ_STATUS } from '../utils/constants';
import { transformBooks } from '../utils/transformBooks';
import { Book, BookTitle, GetListsProps, HardcoverBook, HardcoverList } from '../utils/types';
import { fetchGraphQL } from './fetchEndpoint';

export async function getLists({
    bookId,
    listsMustIncludeBook,
    listsMustExcludeBook 
}: GetListsProps): Promise<{ username: string, lists: HardcoverList[] }> {
    const operation = `
        query GetLists {
            me {
                username
                lists(
                    ${
                        bookId && listsMustIncludeBook ? `where: { list_books: { book: { id: { _eq: ${bookId} } } } },` :
                        bookId && listsMustExcludeBook ? `where: { _not: { list_books: { book: { id: { _eq: ${bookId} } } } } },` :
                        ""
                    }
                    order_by: { created_at: desc }
                ) {
                	id
                	name
                    books_count
                    slug
                	list_books(order_by: { date_added: desc }) {
                        id
                  	    book {
                            id
                    	    title
                  	    }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetchGraphQL(operation);
        return { username: response?.data?.me[0].username, lists: response?.data?.me[0].lists };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch lists');
    }
}

export async function getListBooks(listId: number): Promise<Book[]> {
    const operation = `
        query GetListBooks {
            me {
                lists(where: { id: { _eq: ${listId} } }) {
                    list_books(order_by: { date_added: desc }) {
                        book {
                            ${BOOK_FIELDS_TO_RETURN}
                        }
                    }
                }
            }
        }
    `;

    type ListBook = {
        book: HardcoverBook
    };

    try {
        const response = await fetchGraphQL(operation);
        const listBooks: ListBook[] = response?.data?.me[0].lists[0].list_books || [];
        const hardcoverBooks: HardcoverBook[] = listBooks.map((listBook) => listBook.book);
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

export async function removeBookFromList(listBookId: number) {
    const operation = `
        mutation RemoveBookFromList {
            delete_list_book(id: ${listBookId}) {
                id
            }
        }
    `;

    return fetchGraphQL(operation);
}

export async function getBooksByStatus(statusId: number): Promise<Book[]> {
    const operation = `
        query GetBooksByStatus {
            me {
                user_books(
                    where: { status_id: { _eq: ${statusId} } }
                    order_by: { date_added: desc }
                ) {
                    book {
                        ${BOOK_FIELDS_TO_RETURN}
                    }
                }
            }
        }
    `;

    type UserBook = {
        book: HardcoverBook
    };

    try {
        const response = await fetchGraphQL(operation);
        const userBooks: UserBook[] = response?.data?.me[0].user_books || [];
        const hardcoverBooks: HardcoverBook[] = userBooks.map((userBook) => userBook.book);
        return transformBooks(hardcoverBooks);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user books');
    }
}

export async function getUserBooks(): Promise<{ wantToRead: BookTitle[], currentlyReading: BookTitle[], read: BookTitle[], didNotFinish: BookTitle[] }> {
    const operation = `
        query GetBooksByStatus {
            me {
                user_books {
                    status_id
                    date_added
                    book {
                        title
                    }
                }
            }
        }
    `;

    type UserBook = {
        status_id: number,
        date_added: string,
        book: BookTitle
    };

    try {
        const response = await fetchGraphQL(operation);
        const userBooks: UserBook[] = response?.data?.me[0].user_books || [];

        const wantToRead = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.WANT_TO_READ)
            .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
            .map((userBook) => userBook.book);
        
        const currentlyReading = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.CURRENTLY_READING)
            .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
            .map((userBook) => userBook.book);

        const read = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.READ)
            .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
            .map((userBook) => userBook.book);

        const didNotFinish = userBooks
            .filter((userBook) => userBook.status_id === BOOK_READ_STATUS.DID_NOT_FINISH)
            .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
            .map((userBook) => userBook.book);

        return { wantToRead, currentlyReading, read, didNotFinish };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user books');
    }
}

/* 
Status IDs:
1: Want to Read
2: Currently Reading
3: Read
5: Did Not Finish
*/
export async function changeBookReadStatus(bookId: number, statusId: number) {
    const operation = `
        mutation ChangeBookReadStatus {
            insert_user_book(object: { book_id: ${bookId}, status_id: ${statusId} }) {
                id
            }
        }
    `;

    return fetchGraphQL(operation);
}