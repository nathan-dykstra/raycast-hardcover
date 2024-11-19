import { useEffect, useState } from "react";
import { BookDetailsProps, GetListsProps, HardcoverList } from "./types";
import { addBookToList, getLists, removeBookFromList } from "../api/lists";
import { Action, ActionPanel, Icon, List, open, showToast, Toast } from "@raycast/api";

export function ShowLists({ book, isAddToList = false, isRemoveFromList = false }: BookDetailsProps) {
    const [lists, setLists] = useState<HardcoverList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function fetchLists() {
            try {
                let getListsProps: GetListsProps = {};
                if (isAddToList) {
                    getListsProps = { bookId: book.id, listsMustExcludeBook: true };
                } else if (isRemoveFromList) {
                    getListsProps = { bookId: book.id, listsMustIncludeBook: true };
                }
                const listsData = await getLists(getListsProps);
                setLists(listsData);
            } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to load lists" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchLists();
    }, [refreshKey]);

    return (
        <List isLoading={isLoading} navigationTitle={book.title || ""}>
            <List.EmptyView 
                title={
                    isAddToList ? "This book is already in all of your lists" :
                    isRemoveFromList ? "This book is not in any of your lists" :
                    "No lists found"
                }
            />
            {lists.map((list) => (
                <List.Item
                    key={list.id}
                    title={list.name}
                    subtitle={list.list_books?.map((listBook) => listBook.book.title).join(" • ")}
                    accessories={[
                        { icon: Icon.Book, text: `${list.books_count} book` + (list.books_count === 1 ? "" : "s") }
                    ]}
                    actions={
                        <ActionPanel>
                            {book && isAddToList && (
                                <Action
                                    title="Add to This List"
                                    icon={Icon.PlusCircle}
                                    onAction={async () => {
                                        const toast = await showToast({ style: Toast.Style.Animated, title: "Adding book to list..." });
                                        try {
                                            await addBookToList(book.id, list.id);
                                            toast.style = Toast.Style.Success;
                                            toast.title = "Added book to list";
                                            setRefreshKey((prevKey) => prevKey + 1);
                                        } catch (error) {
                                            toast.style = Toast.Style.Failure;
                                            toast.title = "Failed to add book to list";
                                        }
                                    }}
                                />
                            )}
                            {book && isRemoveFromList && (
                                <Action
                                    title="Remove from This List"
                                    style={Action.Style.Destructive}
                                    icon={Icon.Trash}
                                    onAction={async () => {
                                        const toast = await showToast({ style: Toast.Style.Animated, title: "Removing book from list..." });
                                        try {
                                            const listBookId = list.list_books.find((listBook) => listBook.book.id === book.id)?.id;
                                            if (!listBookId) throw new Error();
                                            await removeBookFromList(listBookId);
                                            toast.style = Toast.Style.Success;
                                            toast.title = "Removed book from list";
                                            setRefreshKey((prevKey) => prevKey + 1);
                                        } catch (error) {
                                            toast.style = Toast.Style.Failure;
                                            toast.title = "Failed to remove book from list";
                                        }
                                    }}
                                />
                            )}
                            {!isAddToList && !isRemoveFromList && (
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/lists/${list.slug}`);
                                    }}
                                />
                            )}
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}