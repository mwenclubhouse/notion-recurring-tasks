import spacetime from "spacetime";
import { GetItemsArgs, NotionItem } from "./type";
import { TIME_ZONE } from "./constants";
import { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const getISO = (year: number, month: number, day: number)  => {
    return `${year}-${month < 10 ? '0': ''}${month}-${day < 10 ? '0': ''}${day}`
}

export const getDate = (): string => {
    const date = spacetime.now(TIME_ZONE);
    return getISO(date.year(), date.month() + 1, date.date());
}

export const getNextDate = (now: Date, dayOfWeek: number): string => {
    let result = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (7 + dayOfWeek - now.getDay()),
        0,
        0,
        0,
        0,
    )
    if (result <= now) {
        result.setDate(result.getDate() + 7)
    }
    return getISO(result.getFullYear(), result.getMonth() + 1, result.getDate());
}

export const getItems = async (getItemArgs: GetItemsArgs): Promise<NotionItem[]> => {
    const {notion, katabanBoard: kataban_board, filter} = getItemArgs;
    const items: NotionItem[] = [];
    let cursor: string | null = null;
    do {
        const response = await notion.databases.query({
            database_id: kataban_board,
            filter: filter,
            start_cursor: cursor ?? undefined
        });
        const {results, next_cursor} = response;
        cursor = next_cursor;
        results.forEach((item: (PageObjectResponse | PartialPageObjectResponse)) => {
            if ((item as PageObjectResponse).properties !== undefined) {
                items.push(item as PageObjectResponse);
            }
        })
    } while(cursor);
    return items;
}
