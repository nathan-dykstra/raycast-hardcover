import { BOOK_FIELDS_TO_RETURN, AUTHOR_FIELDS_TO_RETURN } from '../utils/constants';
import { HardcoverBook, Book, OperationMap, HardcoverAuthor, Author } from '../utils/types';
import { titleCase } from '../helpers/titleCase';
import { fetchGraphQL } from './fetchEndpoint';

type SearchProps = { query: string; limit?: number };

export async function search({ query, limit = 10 }: SearchProps) {
    const bookOperations: OperationMap =  {
        searchBooks1: `
            query SearchBooks1 {
                books(
                    where: { title: { _ilike: "%${query}%" } }
                    limit: 10
                    order_by: { users_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `,
        searchBooks2: `
            query SearchBooks2 {
                books(
                    where: { contributions: { author: { name: { _ilike: "%${query}%" } } } }
                    limit: 10
                    order_by: { users_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `,
        searchBooks3: `
            query SearchBooks3 {
                books(
                    where: { book_series: { series: { name: { _ilike: "%${query}%" } } } }
                    limit: 10
                    order_by: { users_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `,
        searchBooks4: `
            query SearchBooks4 {
                books(
                    where: { editions: { isbn_10: { _eq: "${query}" } } }
                    limit: 10
                    order_by: { users_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `,
        searchBooks5: `
            query SearchBooks5 {
                books(
                    where: { editions: { isbn_13: { _eq: "${query}" } } }
                    limit: 10
                    order_by: { users_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `
        // TODO: performance issues with this query, split up into multiple queries for now
        /*searchBooks: `
            query SearchBooks {
                books(
                    where: { _or: [
                        { title: { _ilike: "%${query}%" } },
                        { contributions: { author: { name: { _ilike: "%${query}%" } } } },
                        { book_series: { series: { name: { _ilike: "%${query}%" } } } },
                        { editions: { isbn_10: { _eq: "${query}" } } },
                        { editions: { isbn_13: { _eq: "${query}" } } }
                    ] }
                    limit: 10
                    order_by: { users_read_count: desc }
                ) {
                    ${BOOK_FIELDS_TO_RETURN}
                }
            }
        `*/
    };

    const authorOperations: OperationMap =  {
        searchAuthors1: `
            query SearchAuthors1 {
                authors(
                    where: { name: { _ilike: "%${query}%" } }
                    limit: 3
                    order_by: { users_count: desc }
                ) {
                    ${AUTHOR_FIELDS_TO_RETURN}
                }
            }
        `,
        searchAuthors2: `
            query SearchAuthors2 {
                authors(
                    where: { contributions: { book: { title: { _ilike: "%${query}%" } } } }
                    limit: 3
                    order_by: { users_count: desc }
                ) {
                    ${AUTHOR_FIELDS_TO_RETURN}
                }
            }
        `,
        searchAuthors3: `
            query SearchAuthors3 {
                authors(
                    where: { contributions: { book: { book_series: { series: { name: { _ilike: "%${query}%" } } } } } }
                    limit: 3
                    order_by: { users_count: desc }
                ) {
                    ${AUTHOR_FIELDS_TO_RETURN}
                }
            }
        `
    };

    // Search for books

    const bookOperationsArray = Object.keys(bookOperations);

    let hardcoverBooks: Array<HardcoverBook> = [];

    await Promise.all(
        bookOperationsArray.map(async (operationName) => {
            const response = await fetchGraphQL(bookOperations[operationName]);
            hardcoverBooks.push(...response?.data?.books);
        })
    );

    hardcoverBooks = Array.from(new Map(hardcoverBooks.map((book) => [book.id, book])).values());
    hardcoverBooks = hardcoverBooks.sort((a, b) => b.users_count - a.users_count);
    hardcoverBooks = hardcoverBooks.slice(0, 10);

    const books = transformBooks(hardcoverBooks);

    // Search for authors

    const authorOperationsArray = Object.keys(authorOperations);

    let hardcoverAuthors: Array<HardcoverAuthor> = [];

    await Promise.all(
        authorOperationsArray.map(async (operationName) => {
            const response = await fetchGraphQL(authorOperations[operationName]);
            hardcoverAuthors.push(...response?.data?.authors);
        })
    );

    hardcoverAuthors = Array.from(new Map(hardcoverAuthors.map((author) => [author.id, author])).values());
    hardcoverAuthors = hardcoverAuthors.sort((a, b) => b.users_count - a.users_count);
    hardcoverAuthors = hardcoverAuthors.slice(0, 3);

    const authors = transformAuthors(hardcoverAuthors);

    return { books, authors };
}

const transformBooks = (hardcoverBooks: Array<HardcoverBook>): Array<Book> => {
    return hardcoverBooks.map((book) => {
        return {
            id: book.id,
            title: book.title,
            description: book.description,
            image: book.image?.url,
            author: book.contributions[0].author.name,
            releaseYear: book.release_year >= 0 ? book.release_year?.toString() : Math.abs(book.release_year) + ' BC',
            usersCount: book.users_count,
            rating: Math.round(book.rating * 10) / 10,
            pages: book.pages,
            genres: (book.cached_tags.Genre || []).slice(0, 3).map((genre) => titleCase(genre.tag)),
            slug: book.slug
        };
    });
}

const transformAuthors = (hardcoverAuthors: Array<HardcoverAuthor>): Array<Author> => {
    return hardcoverAuthors.map((author) => {
        const ratingAcc = (
            author.contributions.reduce(
                (acc, contribution) => {
                    if (contribution.book.rating != null) {
                        acc.sum += contribution.book.rating;
                        acc.count++;
                    }
                    return acc;
                },
                { sum: 0, count: 0 }
            )
        );

        return {
            id: author.id,
            name: author.name,
            image: author.image?.url,
            booksCount: author.books_count,
            slug: author.slug,
            lifespan: author.born_year && author.death_year ? `${author.born_year} - ${author.death_year}` : "",
            usersCount: author.users_count,
            averageRating: ratingAcc.count > 0 ? Math.round((ratingAcc.sum / ratingAcc.count) * 10) / 10 : 0,
            books: author.contributions.slice(0, 10).map((contribution) => contribution.book.title)
        };
    });
}