import { NotionArgs } from "../utils/type";
import { getDate, getItems, getNextDate } from "../utils";
import { COMPLETION_DATE, DATE, RECURRING_DAYS, STATUS, WEEKDAYS } from "../utils/constants";

export const moveRecurringTasksToNotStarted = async (item: NotionArgs) => {
    const {notion, katabanBoard, notStarted, completedLabel} = item;
    const response: any[] = await getItems({notion, katabanBoard, filter: {
            and: [
                {
                    type: "multi_select",
                    property: RECURRING_DAYS,
                    multi_select: {
                        is_not_empty: true,
                    }
                },
                {
                    type: "select",
                    property: STATUS,
                    select: {
                        equals: completedLabel
                    }
                },
                {
                    type: "date",
                    property: DATE,
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

        const date = item.properties[DATE];
        const recurringDays = item.properties[RECURRING_DAYS];
        let properties: any = {};
        if (recurringDays && date) {
            const passedInDate = new Date(date.date.start);
            let resetDay = 7;
            let nextDay = 7;
            recurringDays["multi_select"].forEach((item: any) => {
                const idx = WEEKDAYS.indexOf(item.name);
                if (idx >= 0) {
                    resetDay = idx < resetDay ? idx: resetDay;
                    nextDay = idx < nextDay && idx > passedInDate.getDay() ? idx: nextDay;
                }
            });
            setDay = (nextDay === 7) ? resetDay: nextDay;
            properties[DATE] = {
                "date": {
                    "start": getNextDate(passedInDate, setDay)
                }
            };
        }

        const status = item.properties[STATUS];
        if (status) {
            status.select = {name: notStarted};
            properties[STATUS] = status;
            properties[COMPLETION_DATE] = {
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

