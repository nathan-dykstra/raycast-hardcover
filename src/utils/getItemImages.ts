import { Icon, Image } from "@raycast/api"
import { Author, Book, SimpleBook } from "./types"

export function getBookImage(book: SimpleBook | Book): Image.ImageLike {
    if (!book.image) return Icon.Book
    return {
        source: book.image,
    }
}

export function getAuthorImage(author: Author): Image.ImageLike {
    if (!author.image) return Icon.Person
    return {
        source: author.image,
        mask: author.image ? Image.Mask.Circle : undefined
    }
}