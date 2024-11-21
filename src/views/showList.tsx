import { useEffect, useState } from "react";
import { HardcoverList, SimpleBook } from "../utils/types"
import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { getBookImage } from "../utils/getItemImages";
import { BookDetails } from "./bookDetails";
import { BookActions } from "./bookActions";
import { getBooksByStatus, getListBooks } from "../api/lists";
import { BOOK_READ_STATUS_TO_NAME_MAP } from "../utils/constants";

type ShowListProps = {
    lists: HardcoverList[],
    list?: HardcoverList,
    statusId?: number
}

export function ShowList({ lists, list = undefined, statusId = undefined }: ShowListProps) {
    const [listBooks, setListBooks] = useState<SimpleBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        async function fetchList() {
            try {
                if (list) {
                    const listBooksData = await getListBooks(list.id);
                    setListBooks(listBooksData);
                } else if (statusId) {
                    const listBooksData = await getBooksByStatus(statusId);
                    setListBooks(listBooksData);
                }
            } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to load list" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchList();
    }, [refreshKey]);

    return (
        <List
            isLoading={isLoading}
            navigationTitle={list?.name || (statusId ? BOOK_READ_STATUS_TO_NAME_MAP[statusId] : "")}
            searchBarPlaceholder={`Search ${list?.name || (statusId ? BOOK_READ_STATUS_TO_NAME_MAP[statusId] : "List")}`}
        >
            <List.EmptyView title="This list is empty" />
            {listBooks.map((book) => (
                <List.Item
                    key={book.id}
                    icon={getBookImage(book)}
                    title={book.title}
                    subtitle={book.author}
                    accessories={[
                        { icon: (book.releaseYear ? Icon.Calendar : ""), text: book.releaseYear?.toString() },
                    ]}
                    actions={
                        <ActionPanel>
                            <Action.Push icon={Icon.Eye} title="Show Details" target={<BookDetails book={book} lists={lists} setListRefreshKey={setRefreshKey} />} />
                            <BookActions book={book} lists={lists} setRefreshKey={setRefreshKey} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}