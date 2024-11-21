import { useEffect, useState } from "react";
import { HardcoverList } from "./utils/types";
import { getLists, getUserBooks } from "./api/lists";
import { Action, ActionPanel, Icon, List, open, showToast, Toast } from "@raycast/api";
import { ShowList } from "./views/showList";
import { BOOK_READ_STATUS, USERNAME } from "./utils/constants";

function YourListsCommand() {
    const [lists, setLists] = useState<HardcoverList[]>([]);
    const [wantToRead, setWantToRead] = useState<number>(0);
    const [currentlyReading, setCurrentlyReading] = useState<number>(0);
    const [read, setRead] = useState<number>(0);
    const [didNotFinish, setDidNotFinish] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLists() {
            try {
                const listsData = await getLists();
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
    }, []);

    return (
        <List isLoading={isLoading} searchBarPlaceholder="Search Lists">
            <List.EmptyView title="No lists found" />
            <List.Section title="Books By Reading Status">
                <List.Item
                    key={BOOK_READ_STATUS.WANT_TO_READ}
                    icon={Icon.Bookmark}
                    title="Want to Read"
                    subtitle={`${wantToRead} book` + (wantToRead === 1 ? "" : "s")}
                    actions={
                        <ActionPanel>
                            <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList lists={lists} statusId={BOOK_READ_STATUS.WANT_TO_READ} />} />
                            <Action
                                title="View in Browser"
                                icon={Icon.Globe}
                                onAction={() => {
                                    open(`https://hardcover.app/@${USERNAME}/books/want-to-read`);
                                }}
                            />
                        </ActionPanel>
                    }
                />
                <List.Item
                    key={BOOK_READ_STATUS.CURRENTLY_READING}
                    icon={Icon.Book}
                    title="Currently Reading"
                    subtitle={`${currentlyReading} book` + (currentlyReading === 1 ? "" : "s")}
                    actions={
                        <ActionPanel>
                            <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList lists={lists} statusId={BOOK_READ_STATUS.CURRENTLY_READING} />} />
                            <Action
                                title="View in Browser"
                                icon={Icon.Globe}
                                onAction={() => {
                                    open(`https://hardcover.app/@${USERNAME}/books/currently-reading`);
                                }}
                            />
                        </ActionPanel>
                    }
                />
                <List.Item
                    key={BOOK_READ_STATUS.READ}
                    icon={Icon.CheckCircle}
                    title="Read"
                    subtitle={`${read} book` + (read === 1 ? "" : "s")}
                    actions={
                        <ActionPanel>
                            <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList lists={lists} statusId={BOOK_READ_STATUS.READ} />} />
                            <Action
                                title="View in Browser"
                                icon={Icon.Globe}
                                onAction={() => {
                                    open(`https://hardcover.app/@${USERNAME}/books/read`);
                                }}
                            />
                        </ActionPanel>
                    }
                />
                <List.Item
                    key={BOOK_READ_STATUS.DID_NOT_FINISH}
                    icon={Icon.XMarkCircle}
                    title="Did Not Finish"
                    subtitle={`${didNotFinish} book` + (didNotFinish === 1 ? "" : "s")}
                    actions={
                        <ActionPanel>
                            <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList lists={lists} statusId={BOOK_READ_STATUS.DID_NOT_FINISH} />} />
                            <Action
                                title="View in Browser"
                                icon={Icon.Globe}
                                onAction={() => {
                                    open(`https://hardcover.app/@${USERNAME}/books/did-not-finish`);
                                }}
                            />
                        </ActionPanel>
                    }
                />
            </List.Section>
            <List.Section title="Your Lists">
                {lists.map((list) => (
                    <List.Item
                        key={list.id}
                        icon={Icon.List}
                        title={list.name}
                        subtitle={`${list.books_count} book` + (list.books_count === 1 ? "" : "s")}
                        actions={
                            <ActionPanel>
                                <Action.Push icon={Icon.Eye} title="Show List" target={<ShowList lists={lists} list={list} />} />
                                <Action
                                    title="View in Browser"
                                    icon={Icon.Globe}
                                    onAction={() => {
                                        open(`https://hardcover.app/@${USERNAME}/lists/${list.slug}`);
                                    }}
                                />
                            </ActionPanel>
                        }
                    />
                ))}
            </List.Section>
        </List>
    );
}

export default function Command() {
    return (
        <YourListsCommand />
    );
}