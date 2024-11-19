import { Book, HardcoverBook } from "../utils/types";
import { titleCase } from "./titleCase";

export const transformBooks = (hardcoverBooks: HardcoverBook[]): Book[] => {
    return hardcoverBooks.map((book) => {
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
            slug: book.slug
        };
    });
}