import {Client} from "@notionhq/client";
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
        let setDay = 7;

        const date = item.properties["Date"];
        const recurringDays = item.properties["Recurring Days"];
        let properties: any = {};
        if (recurringDays && date) {
            const passedInDate = new Date(date.date.start);
            const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            let resetDay = 7;
            let nextDay = 7;
            recurringDays["multi_select"].forEach((item: any) => {
                const idx = weekDays.indexOf(item.name);
                if (idx >= 0) {
                    resetDay = idx < resetDay ? idx: resetDay;
                    nextDay = idx < nextDay && idx > passedInDate.getDay() ? idx: nextDay;
                }
            });
            setDay = (nextDay === 7) ? resetDay: nextDay;
            properties["Date"] = {
                "date": {
                    "start": getNextDate(passedInDate, setDay)
                }
            };
        }

        const status = item.properties["Status"];
        if (status) {
            status.select = {name: not_started};
            properties["Status"] = status;
            properties["Completion Date"] = {
                "date": null
            };
        }
        await notion.pages.update({
            page_id: item.id,
            properties: properties,
            archived: false,

        });
    }
}

