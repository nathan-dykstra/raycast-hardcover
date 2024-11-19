import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();

export const HARDCOVER_TOKEN = preferences.hardcoverToken;

export const ENDPOINT = "https://api.hardcover.app/v1/graphql";

export const BOOK_FIELDS_TO_RETURN = `
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
    release_year
    users_count
    rating
    pages
    cached_tags
    slug
`;

export const AUTHOR_FIELDS_TO_RETURN = `
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