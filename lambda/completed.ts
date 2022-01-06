import {DatePropertyValue} from "@notionhq/client/build/src/api-types";
import {Client} from "@notionhq/client/build/src";
import {getDate, getItems} from "./utils";

export const setCompleted = async (item : {notion: Client, kataban_board: string, not_started: string, completed_label: string}) => {
    const {notion, kataban_board, completed_label} = item;
    const response = await getItems({notion, kataban_board, filter: {
            and: [
                {
                    property: 'Completion Date',
                    date: {
                        is_empty: true,
                    }
                },
                {
                    property: 'Status',
                    select: {
                        equals: completed_label
                    }
                }
            ]
        }}
    )

    for (let i = 0; i < response.length; i++) {
        const item = response[i];
        const completed_date: DatePropertyValue | undefined = item.properties['Completion Date'] as DatePropertyValue
        if (completed_date) {
            completed_date.date = {start: getDate()};
        }
        await notion.pages.update({
            page_id: item.id,
            properties: item.properties,
            archived: false
        });
    }
}

