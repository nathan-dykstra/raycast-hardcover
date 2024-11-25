import { ActionPanel, Action, Icon, List, Keyboard, Alert, confirmAlert, LocalStorage, Grid, showToast, Toast } from "@raycast/api";
import { useSearch } from "./utils/useSearch";
import { ComponentProps, useEffect, useState } from "react";
import { useCachedPromise } from "@raycast/utils";
import { debounce } from "./utils/debounce";
import { BookDetails } from "./views/bookDetails";
import { BookActions } from "./views/bookActions";
import { AuthorDetails } from "./views/authorDetails";
import { AuthorActions } from "./views/authorActions";
import { getAuthorImage, getBookImage } from "./utils/getItemImages";
import { HardcoverList } from "./utils/types";
import { getLists } from "./api/lists";

const filters = {
    all: "All",
    books: "Books",
    authors: "Authors",
};

type FilterValue = keyof typeof filters;

function SearchCommand() {
    const [lists, setLists] = useState<HardcoverList[]>([]);
    const [listsIsLoading, setListsIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLists() {
            try {
                const listsData = await getLists();
                setLists(listsData);
            } catch (error) {
                showToast({ style: Toast.Style.Failure, title: "Failed to load lists" });
            } finally {
                setListsIsLoading(false);
            }
        }
        fetchLists();
    }, []);

    const {
        data: recentSearchesData,
        isLoading: recentSearchIsLoading,
        revalidate: recentSearchRevalidate,
    } = useCachedPromise(() => LocalStorage.getItem<string>("recent-searches"));

    const [searchText, setSearchText] = useState<string>("");
    const [searchFilter, setSearchFilter] = useState<FilterValue>("all");

    const { searchData, searchIsLoading } = useSearch({
        query: searchText.trim(),
        options: { keepPreviousData: true },
    });

    const recentSearches: string[] = recentSearchesData ? JSON.parse(recentSearchesData) : [];

    useEffect(() => {
        if (searchText.length > 3 && recentSearches.includes(searchText.trim()) === false && searchIsLoading === false) {
            const addSearchToStorage = debounce(async () => {
                LocalStorage.setItem("recent-searches", JSON.stringify([searchText, ...recentSearches]));
                recentSearchRevalidate();
              }, 3000);
              addSearchToStorage();
        }
    }, [searchText, searchIsLoading]);

    const searchBarAccessory = (
        <List.Dropdown
            tooltip="Filter search"
            value={searchFilter}
            onChange={(newValue) => setSearchFilter(newValue as FilterValue)}
        >
            {Object.entries(filters).map(
                ([value, label]) => (<List.Dropdown.Item key={value} title={label} value={value} />),
            )}
        </List.Dropdown>
    );

    const sharedProps: ComponentProps<typeof List> = {
        searchBarPlaceholder: "Search Hardcover",
        searchBarAccessory,
        searchText,
        onSearchTextChange: setSearchText,
        isLoading: searchIsLoading || recentSearchIsLoading || listsIsLoading,
        throttle: true
    };

    if (!searchText) {
        return (
            <List {...sharedProps}>
                <List.EmptyView title="Type to search" />
                <List.Section title="Recent Searches">
                    {recentSearches.map((term, index) => (
                        <List.Item
                            key={index}
                            title={term}
                            actions={
                                <ActionPanel>
                                    <Action title="Search Again" icon={Icon.MagnifyingGlass} onAction={() => setSearchText(term)} />
                                    <Action
                                        icon={Icon.Trash}
                                        title="Remove Search"
                                        style={Action.Style.Destructive}
                                        shortcut={Keyboard.Shortcut.Common.Remove}
                                        onAction={async () => {
                                            await LocalStorage.setItem(
                                                "recent-searches",
                                                JSON.stringify(recentSearches.filter((item: string) => item !== term)),
                                            );
                                            recentSearchRevalidate();
                                        }}
                                    />
                                    <ActionPanel.Section>
                                        <Action
                                            icon={Icon.Trash}
                                            title="Remove All Searches"
                                            style={Action.Style.Destructive}
                                            shortcut={Keyboard.Shortcut.Common.RemoveAll}
                                            onAction={async () => {
                                                await confirmAlert({
                                                    title: "Are you sure?",
                                                    message: "This will remove all recent searches.",
                                                    primaryAction: {
                                                        title: "Remove",
                                                        style: Alert.ActionStyle.Destructive,
                                                        onAction: async () => {
                                                            await LocalStorage.setItem("recent-searches", JSON.stringify([]));
                                                            recentSearchRevalidate();
                                                        },
                                                    },
                                                    dismissAction: {
                                                        title: "Cancel",
                                                    },
                                                    rememberUserChoice: true,
                                                });
                                            }}
                                        />
                                    </ActionPanel.Section>
                                </ActionPanel>
                            }
                        />
                    ))}
                </List.Section>
            </List>
        );
    }

    if (searchFilter === "all" || searchFilter === "books") {
        return (
            <List {...sharedProps}>
                {searchFilter === "all" && (
                    <List.Section title="Authors">
                        {searchData?.authors?.slice(0, 3).map((author) => (
                            <List.Item
                                key={author.id}
                                icon={getAuthorImage(author)}
                                title={author.name}
                                subtitle={author.booksCount ? `${author.booksCount} books` : ""}
                                actions={
                                    <ActionPanel>
                                        <Action.Push icon={Icon.Eye} title="Show Details" target={<AuthorDetails author={author} />} />
                                        <AuthorActions author={author} />
                                    </ActionPanel>
                                }
                            />
                        ))}
                    </List.Section>
                )}
                {(searchFilter === "all" || searchFilter === "books") && (
                    <List.Section title="Books">
                        {searchData?.books?.map((book) => (
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
                    </List.Section>
                )}
            </List>
        );
    } else if (searchFilter === "authors") {
        return (
            <Grid {...sharedProps} columns={5}>
                <Grid.Section title="Authors" inset={Grid.Inset.Small}>
                    {searchData?.authors?.map((author) => (
                        <Grid.Item
                            key={author.id}
                            content={getAuthorImage(author)}
                            title={author.name}
                            subtitle={author.booksCount ? `${author.booksCount} book` + (author.booksCount === 1 ? "" : "s") : ""}
                            actions={
                                <ActionPanel>
                                    <Action.Push icon={Icon.Eye} title="Show Details" target={<AuthorDetails author={author} />} />
                                    <AuthorActions author={author} />
                                </ActionPanel>
                            }
                        />
                    ))}
                </Grid.Section>
            </Grid>
        );
    }
}

export default function Command() {
    return (
        <SearchCommand />
    );
}