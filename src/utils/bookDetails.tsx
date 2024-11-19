import { Action, ActionPanel, closeMainWindow, Detail, Icon, open } from "@raycast/api";
import { BookDetailsProps } from "./types";
import { BookActions } from "./bookActions";


export function BookDetails({ book }: BookDetailsProps) {
    return (
        <Detail 
            markdown={
                " # " + book.title + "\n\n"
                + (book.author ? " ## By " + book.author + "\n\n" : "")
                + (book.image ? "![](" + book.image + ")\n\n" : "")
                + book.description || ""
            }
            navigationTitle={book.title || ""}
            metadata={
                <Detail.Metadata>
                    {book.releaseYear && <Detail.Metadata.Label icon={Icon.Calendar} title="Year" text={book.releaseYear} />}
                    {book.pages && <Detail.Metadata.Label icon={Icon.Book} title="Pages" text={book.pages.toString()} />}
                    {book.rating && <Detail.Metadata.Label icon={Icon.Star} title="Rating" text={book.rating.toString()} />}
                    {book.usersCount && <Detail.Metadata.Label icon={Icon.TwoPeople} title="Readers" text={book.usersCount.toString()} />}
                    {book.genres?.length && (
                        <Detail.Metadata.TagList title="Genres">
                            {book.genres.map((genre) => (
                                <Detail.Metadata.TagList.Item text={genre} />
                            ))} 
                        </Detail.Metadata.TagList>
                    )}
                </Detail.Metadata>
            }
            actions={
                <ActionPanel>
                    <BookActions book={book} />
                </ActionPanel>
            }
        />
    )
}