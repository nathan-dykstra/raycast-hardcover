import { BOOK_FIELDS } from "../utils/constants";
import { transformBook } from "../utils/transformBooks";
import { Book, HardcoverBook } from "../utils/types"
import { fetchGraphQL } from "./fetchEndpoint";

type GetBookProps = {
    bookId: number
}

export async function getBook({ bookId }: GetBookProps): Promise<Book> {
    const operation = `
        query GetBook {
            books(
                where: { id: { _eq: "${bookId}" } }
                limit: 1
            ) {
                ${BOOK_FIELDS}
            }
        }
    `

    try {
        const response = await fetchGraphQL(operation);
        const hardcoverBook: HardcoverBook = response?.data?.books[0];
        return transformBook(hardcoverBook);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch book');
    }
}