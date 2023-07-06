import spacetime from "spacetime";

export const getISO = (year: number, month: number, day: number)  => {
    return `${year}-${month < 10 ? '0': ''}${month}-${day < 10 ? '0': ''}${day}`
}

export const getDate = (): string => {
    const date = spacetime.now('America/Los_Angeles')
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

export const getItems = async ({notion, kataban_board, filter}: any) => {
    let cursor: undefined | string = undefined;
    const response = [];
    do {
        const {results, next_cursor} = await notion.databases.query({
            database_id: kataban_board,
            start_cursor: cursor,
            filter: filter
        });
        cursor = next_cursor;
        response.push(...results);
    } while(cursor);
    return response;
}
