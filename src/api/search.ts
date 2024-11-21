import { SIMPLE_BOOK_FIELDS, AUTHOR_FIELDS } from '../utils/constants';
import { HardcoverAuthor, Author, SimpleHardcoverBook, SimpleBook } from '../utils/types';
import { fetchGraphQL } from './fetchEndpoint';
import { transformBooks } from '../utils/transformBooks';
import { transformAuthors } from '../utils/transformAuthors';
import { isValidISBN10, isValidISBN13 } from '../utils/validateISBN';

type SearchProps = {
    query: string,
    booksLimit?: number,
    authorsLimit?: number
};

export async function search({ 
    query,
    booksLimit = 15,
    authorsLimit = 15
}: SearchProps): Promise<{ books: SimpleBook[], authors: Author[] }> {
    const defaultBookOperations = [
        `query SearchBooksTitle {
            books(
                where: { title: { _ilike: "%${query}%" } }
                limit: ${booksLimit}
                order_by: { users_count: desc }
            ) {
                ${SIMPLE_BOOK_FIELDS}
            }
        }`,
        `query SearchBooksAuthor {
            books(
                where: { contributions: { author: { name: { _ilike: "%${query}%" } } } }
                limit: ${booksLimit}
                order_by: { users_count: desc }
            ) {
                ${SIMPLE_BOOK_FIELDS}
            }
        }`,
        `query SearchBooksSeries {
            books(
                where: { book_series: { series: { name: { _ilike: "%${query}%" } } } }
                limit: ${booksLimit}
                order_by: { users_count: desc }
            ) {
                ${SIMPLE_BOOK_FIELDS}
            }
        }`
    ];

    const ISBN10BookOperations = [
        `query SearchBooksISBN10 {
            books(
                where: { editions: { isbn_10: { _eq: "${query}" } } }
                limit: ${booksLimit}
                order_by: { users_count: desc }
            ) {
                ${SIMPLE_BOOK_FIELDS}
            }
        }`
    ];

    const ISBN13BookOperations = [
        `query SearchBooksISBN13 {
            books(
                where: { editions: { isbn_13: { _eq: "${query}" } } }
                limit: ${booksLimit}
                order_by: { users_count: desc }
            ) {
                ${SIMPLE_BOOK_FIELDS}
            }
        }`
    ];

    const defaultAuthorOperations = [
        `query SearchAuthorsName {
            authors(
                where: { name: { _ilike: "%${query}%" } }
                limit: ${authorsLimit}
                order_by: { users_count: desc }
            ) {
                ${AUTHOR_FIELDS}
            }
        }`,
        `query SearchAuthorsBooks {
            authors(
                where: { contributions: { book: { title: { _ilike: "%${query}%" } } } }
                limit: ${authorsLimit}
                order_by: { users_count: desc }
            ) {
                ${AUTHOR_FIELDS}
            }
        }`,
        `query SearchAuthorsSeries {
            authors(
                where: { contributions: { book: { book_series: { series: { name: { _ilike: "%${query}%" } } } } } }
                limit: ${authorsLimit}
                order_by: { users_count: desc }
            ) {
                ${AUTHOR_FIELDS}
            }
        }`
    ];

    const ISBN10AuthorOperations = [
        `query SearchAuthorsISBN10 {
            authors(
                where: { contributions: { book: { editions: { isbn_10: { _eq: "${query}" } } } } }
                limit: ${authorsLimit}
                order_by: { users_count: desc }
            ) {
                ${AUTHOR_FIELDS}
            }
        }`
    ];

    const ISBN13AuthorOperations = [
        `query SearchAuthorsISBN13 {
            authors(
                where: { contributions: { book: { editions: { isbn_13: { _eq: "${query}" } } } } }
                limit: ${authorsLimit}
                order_by: { users_count: desc }
            ) {
                ${AUTHOR_FIELDS}
            }
        }`
    ];

    // Search Books

    let hardcoverBooks: SimpleHardcoverBook[] = [];

    await Promise.all(
        defaultBookOperations.map(async (operation) => {
            const response = await fetchGraphQL(operation);
            hardcoverBooks.push(...response?.data?.books);
        })
    );

    if (isValidISBN10(query)) {
        await Promise.all(
            ISBN10BookOperations.map(async (operation) => {
                const response = await fetchGraphQL(operation);
                hardcoverBooks.push(...response?.data?.books);
            })
        );
    } else if (isValidISBN13(query)) {
        await Promise.all(
            ISBN13BookOperations.map(async (operation) => {
                const response = await fetchGraphQL(operation);
                hardcoverBooks.push(...response?.data?.books);
            })
        );
    }

    hardcoverBooks = Array.from(new Map(hardcoverBooks.map((book) => [book.id, book])).values());
    hardcoverBooks = hardcoverBooks.sort((a, b) => b.users_count - a.users_count);
    hardcoverBooks = hardcoverBooks.slice(0, booksLimit);

    const books = transformBooks(hardcoverBooks);

    // Search for authors

    let hardcoverAuthors: HardcoverAuthor[] = [];

    await Promise.all(
        defaultAuthorOperations.map(async (operation) => {
            const response = await fetchGraphQL(operation);
            hardcoverAuthors.push(...response?.data?.authors);
        })
    );

    if (query.length === 10) {
        await Promise.all(
            ISBN10AuthorOperations.map(async (operation) => {
                const response = await fetchGraphQL(operation);
                hardcoverAuthors.push(...response?.data?.authors);
            })
        );
    } else if (query.length === 13) {
        await Promise.all(
            ISBN13AuthorOperations.map(async (operation) => {
                const response = await fetchGraphQL(operation);
                hardcoverAuthors.push(...response?.data?.authors);
            })
        );
    }

    hardcoverAuthors = Array.from(new Map(hardcoverAuthors.map((author) => [author.id, author])).values());
    hardcoverAuthors = hardcoverAuthors.sort((a, b) => b.users_count - a.users_count);
    hardcoverAuthors = hardcoverAuthors.slice(0, authorsLimit);

    const authors = transformAuthors(hardcoverAuthors);

    return { books, authors };
}