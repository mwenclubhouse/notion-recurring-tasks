import {DatePropertyValue, MultiSelectPropertyValue, SelectPropertyValue} from "@notionhq/client/build/src/api-types";
import {Client} from "@notionhq/client/build/src";
import {getDate, getItems, getNextDate} from "./utils";

export const moveRecurringTasksToNotStarted = async (item : {notion: Client, kataban_board: string, not_started: string, completed_label: string}) => {
    const {notion, kataban_board, not_started, completed_label} = item;
    const response = await getItems({notion, kataban_board, filter: {
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
                    property: 'Date',
                    date: {
                        before: getDate()
                    }
                }
            ]
        }}
    );

    for (let i = 0; i < response.length; i++) {
        const item = response[i];
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
            status.select = {name: not_started};
            item.properties["Status"] = status;
            const date_completed: DatePropertyValue = item.properties['Completion Date'] as DatePropertyValue;
            date_completed.date = null;
        }
        delete item.properties["Date Created"]
        await notion.pages.update({
            page_id: item.id,
            properties: item.properties,
            archived: false,

        });
    }
}

