import { ActionPanel, Detail, Icon } from "@raycast/api";
import { AuthorDetailsProps } from "../utils/types";
import { AuthorActions } from "./authorActions";

export function AuthorDetails({ author }: AuthorDetailsProps) {
    return (
        <Detail 
            markdown={
                " # " + author.name + "\n\n"
                + (author.image ? "![](" + author.image + ")\n\n" : "")
                + (author.books.length ? " ## Popular Books\n\n" + author.books.join(" • ") : "")
            }
            navigationTitle={author.name || ""}
            metadata={
                <Detail.Metadata>
                    {author.lifespan && <Detail.Metadata.Label icon={Icon.Calendar} title="Lifespan" text={author.lifespan} />}
                    {author.booksCount && <Detail.Metadata.Label icon={Icon.Book} title="Books" text={author.booksCount.toString()} />}
                    {author.averageRating && <Detail.Metadata.Label icon={Icon.Star} title="Average Rating" text={author.averageRating.toString()} />}
                    {author.usersCount && <Detail.Metadata.Label icon={Icon.TwoPeople} title="Readers" text={author.usersCount.toString()} />}
                </Detail.Metadata>
            }
            actions={
                <ActionPanel>
                    <AuthorActions author={author} />
                </ActionPanel>
            }
        />
    )
}