import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();

export const USERNAME = preferences.hardcoverUsername;

export const HARDCOVER_TOKEN = preferences.hardcoverToken;

export const ENDPOINT = "https://api.hardcover.app/v1/graphql";

export const SIMPLE_BOOK_FIELDS = `
    id
    title
    release_year
    image {
        url
    }
    contributions {
        author {
            name
        }
    }
    users_count
    slug
`;

export const BOOK_FIELDS = `
    id
    title
    description
    image {
        url
    }
    contributions {
        author {
            name
        }
    }
    book_series {
        series {
            name
            primary_books_count
        }
        position
    }
    release_year
    users_count
    rating
    pages
    cached_tags
    slug
    user_books(
        where: { user: { username: { _eq: "${USERNAME}" } } }
        limit: 1
    ) {
        status_id
    }
`;

export const AUTHOR_FIELDS = `
    id
    name
    image {
      url
    }
    books_count
    born_year
    death_year
    slug
    users_count
    contributions(
        where: { book: { title: { _is_null: false } } }
        order_by: { book: { users_count: desc } }
    ) {
        book {
            title
            rating
        }
    }
`;

export const BOOK_READ_STATUS = {
    WANT_TO_READ: 1,
    CURRENTLY_READING: 2,
    READ: 3,
    DID_NOT_FINISH: 5
}

export const BOOK_READ_STATUS_TO_NAME_MAP = {
    [BOOK_READ_STATUS.WANT_TO_READ]: "Want to Read",
    [BOOK_READ_STATUS.CURRENTLY_READING]: "Currently Reading",
    [BOOK_READ_STATUS.READ]: "Read",
    [BOOK_READ_STATUS.DID_NOT_FINISH]: "Did Not Finish"
}