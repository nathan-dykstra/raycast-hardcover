import { Book, HardcoverBook, SimpleBook, SimpleHardcoverBook } from "../utils/types";
import { titleCase } from "./titleCase";

export const transformBooks = (hardcoverBooks: SimpleHardcoverBook[]): SimpleBook[] => {
    return hardcoverBooks.map((book) => {
        return {
            id: book.id,
            title: book.title || "",
            author: book.contributions[0]?.author?.name || "",
            releaseYear: book.release_year < 0 ? Math.abs(book.release_year) + ' BC' : book.release_year?.toString() || "",
            image: book.image?.url || "",
            usersCount: book.users_count,
            slug: book.slug
        };
    });
}

export const transformBook = (book: HardcoverBook): Book => {
    return {
        id: book.id,
        title: book.title || "",
        description: book.description || "",
        image: book.image?.url || "",
        author: book.contributions[0]?.author?.name || "",
        releaseYear: book.release_year < 0 ? Math.abs(book.release_year) + ' BC' : book.release_year?.toString() || "",
        usersCount: book.users_count,
        rating: Math.round(book.rating * 10) / 10,
        pages: book.pages,
        genres: (book.cached_tags.Genre || []).slice(0, 3).map((genre) => titleCase(genre.tag)),
        series: (book.book_series || []).slice(0, 3).map((bookSeries) => `\\#${bookSeries.position} of ${bookSeries.series.primary_books_count} in ${bookSeries.series.name}`),
        slug: book.slug,
        readStatus: book.user_books[0]?.status_id || 0
    };
}