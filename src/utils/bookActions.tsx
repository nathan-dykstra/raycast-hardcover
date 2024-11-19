import { Action, ActionPanel, closeMainWindow, Icon, open, showToast, Toast } from "@raycast/api";
import { BookDetailsProps } from "./types";
import { changeBookReadStatus } from "../api/lists";
import { BOOK_READ_STATUS } from "./constants";
import { ShowLists } from "./showLists";

export function BookActions({ book }: BookDetailsProps) {
    return (
        <>
            <Action
                title="Open in Browser"
                icon={Icon.Globe}
                onAction={() => {
                    if (!book.slug) return;
                    open(`https://hardcover.app/books/${book.slug}`);
                    closeMainWindow();
                }}
            />
            <ActionPanel.Section>
                <Action.Push icon={Icon.PlusCircle} title="Add to List" target={<ShowLists book={book} isAddToList={true} />} />
                <Action.Push icon={Icon.XMarkCircle} title="Remove from List" target={<ShowLists book={book} isRemoveFromList={true} />} />
            </ActionPanel.Section>
            <ActionPanel.Section>
                <Action
                    title="Want to Read"
                    icon={Icon.Bookmark}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating book status..." });
                        try {
                            await changeBookReadStatus(book.id, BOOK_READ_STATUS.WANT_TO_READ);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book marked as 'Want to Read'";
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to update book status";
                        }
                    }}
                />
                <Action
                    title="Currently Reading"
                    icon={Icon.Book}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating book status..." });
                        try {
                            await changeBookReadStatus(book.id, BOOK_READ_STATUS.CURRENTLY_READING);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book marked as 'Currently Reading'";
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to update book status";
                        }
                    }}
                />
                <Action
                    title="Read"
                    icon={Icon.CheckCircle}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating book status..." });
                        try {
                            await changeBookReadStatus(book.id, BOOK_READ_STATUS.READ);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book marked as 'Read'";
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to update book status";
                        }
                    }}
                />
                <Action
                    title="Did Not Finish"
                    icon={Icon.XMarkCircle}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating book status..." });
                        try {
                            await changeBookReadStatus(book.id, BOOK_READ_STATUS.DID_NOT_FINISH);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book marked as 'Did Not Finish'";
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to update book status";
                        }
                    }}
                />
            </ActionPanel.Section>
        </>
    );
}