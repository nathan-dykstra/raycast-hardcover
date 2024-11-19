import { useEffect, useState } from "react";
import { Book, BookTitle, GetListsProps, HardcoverList } from "./types";
import { addBookToList, getLists, getUserBooks, removeBookFromList } from "../api/lists";
import { Action, ActionPanel, Icon, List, open, showToast, Toast } from "@raycast/api";
import { ShowList } from "./showList";
import { BOOK_READ_STATUS } from "./constants";

type ShowListsProps = {
    book?: Book,
    isAddToList?: boolean,
    isRemoveFromList?: boolean
}

export function ShowLists({ book = undefined, isAddToList = false, isRemoveFromList = false }: ShowListsProps) {
    const [lists, setLists] = useState<HardcoverList[]>([]);
    const [username, setUsername] = useState("");

    const [wantToRead, setWantToRead] = useState<BookTitle[]>([]);
    const [currentlyReading, setCurrentlyReading] = useState<BookTitle[]>([]);
    const [read, setRead] = useState<BookTitle[]>([]);
    const [didNotFinish, setDidNotFinish] = useState<BookTitle[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function fetchLists() {
            try {
                let getListsProps: GetListsProps = {};
                if (book && isAddToList) {
                    getListsProps = { bookId: book.id, listsMustExcludeBook: true };
                } else if (book && isRemoveFromList) {
                    getListsProps = { bookId: book.id, listsMustIncludeBook: true };
                }

                const { username, lists: listsData } = await getLists(getListsProps);
                setUsername(username);
                setLists(listsData);

                const { wantToRead: wantToReadData, currentlyReading: currentlyReadingData, read: readData, didNotFinish: didNotFinishData } = await getUserBooks();
                setWantToRead(wantToReadData);
                setCurrentlyReading(currentlyReadingData);
                setRead(readData);
                setDidNotFinish(didNotFinishData);
            } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to load lists" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchLists();
    }, [refreshKey]);

    return (
        <List isLoading={isLoading} navigationTitle={book?.title || ""} searchBarPlaceholder="Search Lists">
            <List.EmptyView 
                title={
                    isAddToList ? "This book is already in all of your lists" :
                    isRemoveFromList ? "This book is not in any of your lists" :
                    "No lists found"
                }
            />
            {!isAddToList && !isRemoveFromList && (
                <List.Section title="Books By Reading Status">
                    <List.Item
                        key={BOOK_READ_STATUS.WANT_TO_READ}
                        icon={Icon.Bookmark}
                        title="Want to Read"
                        subtitle={wantToRead.map((book) => book.title).join(" • ")}
                        accessories={[
                            { icon: Icon.Book, text: `${wantToRead.length} book` + (wantToRead.length === 1 ? "" : "s") }
                        ]}
                        actions={
                            <ActionPanel>
                                <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList statusId={BOOK_READ_STATUS.WANT_TO_READ} />} />
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/@${username}/books/want-to-read`);
                                    }}
                                />
                            </ActionPanel>
                        }
                    />
                    <List.Item
                        key={BOOK_READ_STATUS.CURRENTLY_READING}
                        icon={Icon.Book}
                        title="Currently Reading"
                        subtitle={currentlyReading.map((book) => book.title).join(" • ")}
                        accessories={[
                            { icon: Icon.Book, text: `${currentlyReading.length} book` + (currentlyReading.length === 1 ? "" : "s") }
                        ]}
                        actions={
                            <ActionPanel>
                                <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList statusId={BOOK_READ_STATUS.CURRENTLY_READING} />} />
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/@${username}/books/currently-reading`);
                                    }}
                                />
                            </ActionPanel>
                        }
                    />
                    <List.Item
                        key={BOOK_READ_STATUS.READ}
                        icon={Icon.CheckCircle}
                        title="Read"
                        subtitle={read.map((book) => book.title).join(" • ")}
                        accessories={[
                            { icon: Icon.Book, text: `${read.length} book` + (read.length === 1 ? "" : "s") }
                        ]}
                        actions={
                            <ActionPanel>
                                <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList statusId={BOOK_READ_STATUS.READ} />} />
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/@${username}/books/read`);
                                    }}
                                />
                            </ActionPanel>
                        }
                    />
                    <List.Item
                        key={BOOK_READ_STATUS.DID_NOT_FINISH}
                        icon={Icon.XMarkCircle}
                        title="Did Not Finish"
                        subtitle={didNotFinish.map((book) => book.title).join(" • ")}
                        accessories={[
                            { icon: Icon.Book, text: `${didNotFinish.length} book` + (didNotFinish.length === 1 ? "" : "s") }
                        ]}
                        actions={
                            <ActionPanel>
                                <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList statusId={BOOK_READ_STATUS.DID_NOT_FINISH} />} />
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/@${username}/books/did-not-finish`);
                                    }}
                                />
                            </ActionPanel>
                        }
                    />
                </List.Section>
            )}
            <List.Section title="Your Lists">
                {lists.map((list) => (
                    <List.Item
                        key={list.id}
                        icon={Icon.List}
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
                                    <>
                                        <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList list={list} />} />
                                        <Action
                                            title="View in Browser"
                                            icon={Icon.Globe}
                                            onAction={() => {
                                                open(`https://hardcover.app/@${username}/lists/${list.slug}`);
                                            }}
                                        />
                                    </>
                                )}
                            </ActionPanel>
                        }
                    />
                ))}
            </List.Section>
        </List>
    );
}