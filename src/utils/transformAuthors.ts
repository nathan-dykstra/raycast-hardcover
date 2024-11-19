import { Author, HardcoverAuthor } from "../utils/types";

export const transformAuthors = (hardcoverAuthors: HardcoverAuthor[]): Author[] => {
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