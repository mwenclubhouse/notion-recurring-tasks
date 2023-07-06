import {Client} from "@notionhq/client";
import {getItems} from "./utils";

/*
 * Note: Not Used in Production. It Breaks via Docker Container
*/
export const setNotCompleted = async (item : {notion: Client, kataban_board: string, not_started: string, completed_label: string}) => {
    const {notion, kataban_board, completed_label} = item;
    const response = await getItems({notion, kataban_board, filter: {
            and: [
                {
                    property: 'Completion Date',
                    date: {
                        is_not_empty: true,
                    }
                },
                {
                    property: 'Status',
                    select: {
                        does_not_equal: completed_label
                    }
                }
            ]
        }}
    );
    for (let i = 0; i < response.length; i++) {
        const item = response[i];
        const completed_date: any = item.properties['Completion Date']
        const properties: any = {}
        if (completed_date) {
            completed_date.date = null;
            properties["Completion Date"] = completed_date
        }
        await notion.pages.update({
            page_id: item.id,
            properties: properties,
            archived: false
        });
    }
}

