import { ActionPanel, Action, Icon, List, Keyboard, Alert, confirmAlert, LocalStorage, LaunchProps } from "@raycast/api";
import { useSearch } from "./hooks/useSearch";
import { ComponentProps, useEffect, useState } from "react";
import { useCachedPromise } from "@raycast/utils";
import { debounce } from "./helpers/debounce";
import { BookDetails } from "./utils/bookDetails";
import { BookActions } from "./utils/bookActions";
import { AuthorDetails } from "./utils/authorDetails";
import { AuthorActions } from "./utils/authorActions";

const filters = {
    all: "All",
    books: "Books",
    authors: "Authors",
    //series: "Series"
};

type FilterValue = keyof typeof filters;

function SearchCommand({ initialSearchText }: { initialSearchText?: string }) {

    const {
        data: recentSearchesData,
        isLoading: recentSearchIsLoading,
        revalidate: recentSearchRevalidate,
    } = useCachedPromise(() => LocalStorage.getItem<string>("recent-searches"));

    const [searchText, setSearchText] = useState<string>(initialSearchText || "");

    const [searchFilter, setSearchFilter] = useState<FilterValue>("all");

    const { searchData, searchIsLoading } = useSearch({
        query: searchText,
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

    const sharedProps: ComponentProps<typeof List> = {
        searchBarPlaceholder: "Search Hardcover...",
        searchText,
        onSearchTextChange: setSearchText,
        isLoading: searchIsLoading || recentSearchIsLoading,
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
                                    <ActionPanel.Section>
                                        <Action
                                            title="Remove Search"
                                            icon={Icon.Trash}
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
                                        <Action
                                            title="Remove All Searches"
                                            icon={Icon.Trash}
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

    return (
        <List {...sharedProps} searchBarAccessory={searchBarAccessory}>
            <List.Section title="Authors">
                {searchData?.authors?.map((author) => (
                    <List.Item
                        key={author.id}
                        icon={author.image || Icon.Person}
                        title={author.name}
                        subtitle={author.booksCount ? `${author.booksCount} books` : ""}
                        actions={
                            <ActionPanel>
                                <Action.Push title="Show Details" target={<AuthorDetails author={author} />} />
                                <AuthorActions author={author} />
                            </ActionPanel>
                        }
                    />
                ))}
            </List.Section>
            <List.Section title="Books">
                {searchData?.books?.map((book) => (
                    <List.Item
                        key={book.id}
                        icon={book.image || Icon.Book}
                        title={book.title}
                        subtitle={book.author || ""}
                        accessories={[
                            { icon: Icon.Calendar, text: book.releaseYear?.toString() || "" },
                        ]}
                        actions={
                            <ActionPanel>
                                <Action.Push title="Show Details" target={<BookDetails book={book} />} />
                                <BookActions book={book} />
                            </ActionPanel>
                        }
                    />
                ))}
            </List.Section>
        </List>
    );
}

export default function Command({ launchContext, fallbackText }: LaunchProps<{ launchContext: { query: string } }>) {
    return (
        <SearchCommand initialSearchText={launchContext?.query ?? fallbackText} />
    );
}