import { ActionPanel, Detail, Icon, showToast, Toast } from "@raycast/api";
import { Book, BookDetailsProps } from "../utils/types";
import { BookActions } from "./bookActions";
import { BOOK_READ_STATUS } from "../utils/constants";
import { useEffect, useState } from "react";
import { getBook } from "../api/book";

export function BookDetails({ book, lists, setListRefreshKey }: BookDetailsProps) {
    const [bookDetails, setBookDetails] = useState<Book>();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function fetchBook() {
            try {
                setIsLoading(true);
                const bookDetailsData = await getBook({ bookId: book.id });
                setBookDetails(bookDetailsData);
            } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to load list" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchBook();

        if (setListRefreshKey) setListRefreshKey((prev) => prev + 1);
    }, [refreshKey]);

    if (bookDetails) {
        return (
            <Detail
                isLoading={isLoading}
                navigationTitle={bookDetails.title || ""}
                markdown={
                    " # " + bookDetails.title + "\n\n"
                    + (bookDetails.author ? " ## By " + bookDetails.author + "\n\n" : "")
                    + (bookDetails.series.length ? (bookDetails.series.join("\n\n") + "\n\n") : "")
                    + (bookDetails.image ? "![](" + bookDetails.image + ")\n\n" : "")
                    + bookDetails.description || ""
                }
                metadata={
                    <Detail.Metadata>
                        {bookDetails.readStatus && (
                            <Detail.Metadata.TagList title="Reading Status">
                                {(() => {
                                    let text, icon, colour;
    
                                    switch (bookDetails.readStatus) {
                                        case BOOK_READ_STATUS.WANT_TO_READ:
                                            text = "Want to Read";
                                            icon = Icon.Bookmark;
                                            colour = "#FACC14";
                                            break;
                                        case BOOK_READ_STATUS.CURRENTLY_READING:
                                            text = "Currently Reading";
                                            icon = Icon.Book;
                                            colour = "#22C55D";
                                            break;
                                        case BOOK_READ_STATUS.READ:
                                            text = "Read";
                                            icon = Icon.CheckCircle;
                                            colour = "#49DE80";
                                            break;
                                        case BOOK_READ_STATUS.DID_NOT_FINISH:
                                            text = "Did Not Finish";
                                            icon = Icon.XMarkCircle;
                                            colour = "#6466F1";
                                            break;
                                    }
    
                                    return <Detail.Metadata.TagList.Item icon={icon} text={text} color={colour} />;
                                })()}
                            </Detail.Metadata.TagList>
                        )}
                        {bookDetails.releaseYear && <Detail.Metadata.Label icon={Icon.Calendar} title="Year" text={bookDetails.releaseYear} />}
                        {bookDetails.pages && <Detail.Metadata.Label icon={Icon.Book} title="Pages" text={bookDetails.pages.toString()} />}
                        {bookDetails.rating && <Detail.Metadata.Label icon={Icon.Star} title="Rating" text={bookDetails.rating.toString()} />}
                        {bookDetails.usersCount && <Detail.Metadata.Label icon={Icon.TwoPeople} title="Readers" text={bookDetails.usersCount.toString()} />}
                        {bookDetails.genres?.length && (
                            <Detail.Metadata.TagList title="Genres">
                                {bookDetails.genres.map((genre) => (
                                    <Detail.Metadata.TagList.Item text={genre} />
                                ))} 
                            </Detail.Metadata.TagList>
                        )}
                    </Detail.Metadata>
                }
                actions={
                    <ActionPanel>
                        <BookActions book={book} lists={lists} setRefreshKey={setRefreshKey} />
                    </ActionPanel>
                }
            />
        )
    }
    return <Detail isLoading={true} navigationTitle={book.title || ""} />
}