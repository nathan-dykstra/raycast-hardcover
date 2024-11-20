import { useEffect, useState } from "react";
import { Book, HardcoverList } from "./types"
import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { getBookImage } from "./getItemImages";
import { BookDetails } from "./bookDetails";
import { BookActions } from "./bookActions";
import { getBooksByStatus, getListBooks } from "../api/lists";
import { BOOK_READ_STATUS } from "./constants";

const statusIdToNameMap = {
    [BOOK_READ_STATUS.WANT_TO_READ]: "Want to Read",
    [BOOK_READ_STATUS.CURRENTLY_READING]: "Currently Reading",
    [BOOK_READ_STATUS.READ]: "Read",
    [BOOK_READ_STATUS.DID_NOT_FINISH]: "Did Not Finish"
}

type ShowListProps = {
    lists: HardcoverList[],
    list?: HardcoverList,
    statusId?: number
}

export function ShowList({ lists, list = undefined, statusId = undefined }: ShowListProps) {
    const [listBooks, setListBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    }, []);

    return (
        <List 
            isLoading={isLoading}
            navigationTitle={list?.name || (statusId ? statusIdToNameMap[statusId] : "")}
            searchBarPlaceholder={`Search ${list?.name || (statusId ? statusIdToNameMap[statusId] : "List")}`}
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
                            <Action.Push icon={Icon.Eye} title="Show Details" target={<BookDetails book={book} lists={lists} />} />
                            <BookActions book={book} lists={lists} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
