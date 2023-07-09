import {getDate, getItems} from "../utils";
import { COMPLETION_DATE, STATUS } from "../utils/constants";
import { NotionArgs } from "../utils/type";

export const setCompleted = async (item : NotionArgs) => {
    const {notion, katabanBoard, completedLabel} = item;
    const response: any[] = await getItems({notion, katabanBoard, filter: {
            and: [
                {
                    type: "date",
                    property: COMPLETION_DATE,
                    date: {
                        is_empty: true,
                    }
                },
                {
                    type: "select",
                    property: STATUS,
                    select: {
                        equals: completedLabel
                    }
                }
            ]
        }}
    )

    for (let i = 0; i < response.length; i++) {
        const item = response[i];
        const completedDate: any = item.properties[COMPLETION_DATE] 
        if (completedDate) {
            completedDate.date = {start: getDate()};
        }
        let properties: any = {};
        properties[COMPLETION_DATE] = completedDate;
        await notion.pages.update({
            page_id: item.id,
            properties,
            archived: false
        });
    }
}

