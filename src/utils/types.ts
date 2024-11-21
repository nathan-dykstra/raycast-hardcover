// SimpleHardcoverBook & SimpleBook is used to display books in list view (i.e. search results)

export type SimpleHardcoverBook = {
    id: number,
    title: string,
    release_year: number,
    image: {
        url: string
    },
    contributions: {
        author: {
            name: string
        }
    }[],
    users_count: number,
    slug: string
}

export type SimpleBook = {
    id: number,
    title: string,
    releaseYear: string,
    image: string,
    author: string
    usersCount: number,
    slug: string
}

// HardcoverBook & Book is used to display books in detail view

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
    book_series: {
        series: {
            name: string,
            primary_books_count: number
        }
        position: number
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
    slug: string,
    user_books: {
        status_id: number
    }[]
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
    series: string[],
    slug: string,
    readStatus: number
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

export type HardcoverList = {
    id: number,
    name: string,
    description: string,
    slug: string,
    books_count: number,
}

export type BookDetailsProps = {
    book: SimpleBook | Book,
    lists: HardcoverList[],
    setListRefreshKey?: React.Dispatch<React.SetStateAction<number>>
    setRefreshKey?: React.Dispatch<React.SetStateAction<number>>
}

export type AuthorDetailsProps = {
    author: Author
}