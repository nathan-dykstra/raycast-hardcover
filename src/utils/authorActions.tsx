import { Action, closeMainWindow, Icon, open } from "@raycast/api";
import { AuthorDetailsProps } from "./types";


export function AuthorActions({ author }: AuthorDetailsProps) {
    return (
        <>
            <Action
                title="Open in Browser"
                icon={Icon.Globe}
                onAction={() => {
                    if (!author.slug) return;
                    open(`https://hardcover.app/authors/${author.slug}`);
                    closeMainWindow();
                }}
            />
        </>
    );
}