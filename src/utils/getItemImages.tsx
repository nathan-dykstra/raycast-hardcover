import { Icon, Image } from "@raycast/api"
import { Author, Book } from "./types"

export function getBookImage(book: Book): Image.ImageLike {
    return {
        source: book.image,
        fallback: Icon.Book
    }
}

export function getAuthorImage(author: Author): Image.ImageLike {
    return {
        source: author.image,
        fallback: Icon.Person,
        mask: author.image ? Image.Mask.Circle : undefined
    }
}