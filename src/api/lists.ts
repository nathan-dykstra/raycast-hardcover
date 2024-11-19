import { GetListsProps, HardcoverList } from '../utils/types';
import { fetchGraphQL } from './fetchEndpoint';

export async function getLists({
    bookId,
    listsMustIncludeBook,
    listsMustExcludeBook 
}: GetListsProps): Promise<HardcoverList[]> {
    const operation = `
        query GetLists {
            me {
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
        return response?.data?.me[0].lists;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch lists');
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