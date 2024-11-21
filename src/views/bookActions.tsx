import { Action, ActionPanel, closeMainWindow, Icon, open, showToast, Toast } from "@raycast/api";
import { BookDetailsProps } from "../utils/types";
import { addBookToList, changeBookReadStatus, removeBookFromList, removeBookReadStatus } from "../api/lists";
import { BOOK_READ_STATUS } from "../utils/constants";

export function BookActions({ book, lists, setRefreshKey = undefined }: BookDetailsProps) {
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
            <ActionPanel.Section title="Your Lists">
                <ActionPanel.Submenu icon={Icon.PlusCircle} title="Add to List">
                    {lists?.map((list) => {
                        return (
                            <Action
                                key={list.id}
                                title={list.name}
                                onAction={async () => {
                                    const toast = await showToast({ style: Toast.Style.Animated, title: "Adding book to list..." });
                                    try {
                                        await addBookToList(book.id, list.id);
                                        toast.style = Toast.Style.Success;
                                        toast.title = `Book added to list '${list.name}'`;
                                    } catch (error) {
                                        toast.style = Toast.Style.Failure;
                                        toast.title = "Failed to add book to list";
                                    }
                                }}
                            />
                        )
                    })}
                </ActionPanel.Submenu>
                <ActionPanel.Submenu icon={Icon.XMarkCircle} title="Remove from List">
                    {lists?.map((list) => {
                        return (
                            <Action
                                key={list.id}
                                title={list.name}
                                onAction={async () => {
                                    const toast = await showToast({ style: Toast.Style.Animated, title: "Removing book from list..." });
                                    try {
                                        await removeBookFromList(book.id, list.id);
                                        toast.style = Toast.Style.Success;
                                        toast.title = `Book removed from list '${list.name}'`;
                                    } catch (error) {
                                        toast.style = Toast.Style.Failure;
                                        toast.title = "Failed to remove book from list";
                                    }
                                }}
                            />
                        )
                    })}
                </ActionPanel.Submenu>
            </ActionPanel.Section>
            <ActionPanel.Section title="Reading Status">
                <Action
                    title="Want to Read"
                    icon={Icon.Bookmark}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating book status..." });
                        try {
                            await changeBookReadStatus(book.id, BOOK_READ_STATUS.WANT_TO_READ);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book marked as 'Want to Read'";
                            if (setRefreshKey) setRefreshKey((prev) => prev + 1);
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
                            if (setRefreshKey) setRefreshKey((prev) => prev + 1);
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
                            if (setRefreshKey) setRefreshKey((prev) => prev + 1);
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
                            if (setRefreshKey) setRefreshKey((prev) => prev + 1);
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to update book status";
                        }
                    }}
                />
                <Action
                    title="Remove"
                    icon={Icon.Trash}
                    onAction={async () => {
                        const toast = await showToast({ style: Toast.Style.Animated, title: "Removing book status..." });
                        try {
                            await removeBookReadStatus(book.id);
                            toast.style = Toast.Style.Success;
                            toast.title = "Book status removed";
                            if (setRefreshKey) setRefreshKey((prev) => prev + 1);
                        } catch (error) {
                            toast.style = Toast.Style.Failure;
                            toast.title = "Failed to remove book status";
                        }
                    }}
                />
            </ActionPanel.Section>
        </>
    );
}