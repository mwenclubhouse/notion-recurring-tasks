import {Client} from "@notionhq/client/build/src";
import {DatePropertyValue, MultiSelectPropertyValue, SelectPropertyValue} from "@notionhq/client/build/src/api-types";
import spacetime from "spacetime";

const getISO = (year: number, month: number, day: number)  => {
    return `${year}-${month < 10 ? '0': ''}${month}-${day < 10 ? '0': ''}${day}`
}

const getDate = (): string => {
    const date = spacetime.now('America/Indianapolis')
    return getISO(date.year(), date.month() + 1, date.date());
}

const getNextDate = (now: Date, dayOfWeek: number): string => {
    let result = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (7 + dayOfWeek - now.getDay()) % 7,
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

const auth = process.env.NOTION_AUTH;
const kataban_board = process.env.NOTION_KATABAN_BOARD;
const not_started = process.env.NOTION_NOT_STARTED_LABEL_ID;
const completed_label = process.env.NOTION_COMPLETED_LABEL;
const notion = new Client({
    auth
});

export const handler = async () => {

    let cursor: undefined | string = undefined;
    const response = [];
    do {
        const {results, next_cursor} = await notion.databases.query({
            database_id: kataban_board,
            start_cursor: cursor,
            filter: {
                and: [
                    {
                        property: 'Recurring Days',
                        multi_select: {
                            is_not_empty: true,
                        }
                    },
                    {
                        property: 'Status',
                        select: {
                            equals: completed_label
                        }
                    },
                    {
                        property: "Date",
                        date: {
                            before: getDate()
                        }
                    }
                ]
            }
        });
        cursor = next_cursor;
        response.push(...results);
    } while(cursor);

    for (let i = 0; i < response.length; i++) {
        const item = response[i];
        console.log('OLD:', item);

        let set_day = 7;
        const date: DatePropertyValue = item.properties["Date"] as DatePropertyValue;
        const recurring_days: MultiSelectPropertyValue = item.properties["Recurring Days"] as MultiSelectPropertyValue;
        if (recurring_days && date) {
            const passed_in_date = new Date(date.date.start);
            const week_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            let reset_day = 7;
            let next_day = 7;
            recurring_days.multi_select.forEach((item) => {
                const idx = week_days.indexOf(item.name);
                if (idx >= 0) {
                    reset_day = idx < reset_day ? idx: reset_day;
                    next_day = idx < next_day && idx > passed_in_date.getDay() ? idx: next_day;
                }
            });
            set_day = (next_day === 7) ? reset_day: next_day;
            date.date.start = getNextDate(passed_in_date, set_day);
            delete date.date.end;
            item.properties["Date"] = date;
        }

        const status: SelectPropertyValue = item.properties["Status"] as SelectPropertyValue;
        if (status) {
            status.select = {id: not_started};
            item.properties["Status"] = status;
        }

        console.log('NEW:', item);
        await notion.pages.update({
            page_id: item.id,
            properties: item.properties,
            archived: false
        });
    }
}

const runAsync = () => {
    handler().then( () => {
        setTimeout(runAsync, 5000)
        }
    )
}
if (process.env.IS_EC2_INSTANCE) {
    runAsync();
}
