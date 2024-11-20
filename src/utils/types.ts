export type HardcoverBook = {
    id: number,
    title: string,
    description: string,
    image: {
        url: string
    },
    contributions: {
        author: {
            name: string
        }
    }[],
    release_year: number,
    users_count: number,
    rating: number,
    pages: number,
    cached_tags: {
        Genre: any[] | null,
        Mood: any[] | null,
        "Content Warning": any[] | null,
        Tag: any[] | null
    },
    slug: string
}

export type HardcoverAuthor = {
    id: number,
    name: string,
    image: {
        url: string
    },
    books_count: number,
    slug: string,
    born_year: number,
    death_year: number,
    users_count: number,
    contributions: {
        book: {
            title: string,
            rating: number
        }
    }[]
}

export type Author = {
    id: number,
    name: string,
    image: string,
    booksCount: number,
    slug: string,
    lifespan: string,
    usersCount: number,
    averageRating: number,
    books: string[]
}

export type Book = {
    id: number,
    title: string,
    description: string,
    image: string,
    author: string,
    releaseYear: string,
    usersCount: number,
    rating: number,
    pages: number,
    genres: string[],
    slug: string
}

export type HardcoverList = {
    id: number,
    name: string,
    description: string,
    slug: string,
    books_count: number,
}

export type BookDetailsProps = {
    book: Book,
    lists: HardcoverList[],
}

export type AuthorDetailsProps = {
    author: Author
}