import { getDate, getItems, getNextDate } from "../utils";
import { COMPLETION_DATE, DATE, STATUS } from "../utils/constants";
import { NotionArgs, NotionItem } from "../utils/type";

export const updateDateProperties = async (item: NotionArgs) => {
    const {notion, katabanBoard, completedLabel} = item;
    const response: NotionItem[] = await getItems({notion, katabanBoard, filter: {
        and: [
            {
                type: "date",
                property: DATE,
                date: {
                    is_empty: true
                }
            }
        ]
    }})

    for (let i = 0; i < response.length; i++) {
        const item: NotionItem = response[i];
        const properties = getUpdatedProperties(item, completedLabel);
        await notion.pages.update({
            page_id: item.id,
            properties: properties,
            archived: false,
        });
    }
}

const getUpdatedProperties = (item: any, completedLabel: string): any => {
    const status = item.properties[STATUS]
    const createdTime = item["created_time"];
    const completionDate = item.properties[COMPLETION_DATE];

    const date = item.properties[DATE];

    const itemLabel = (status?.select?.name) || undefined;
    if ( itemLabel !== undefined && itemLabel === completedLabel) {
        if (completionDate?.date?.start === undefined) {
            completionDate.date = {start: getDate()}
            date.date = {start: getDate()}
        }
        else {
            date.date = {start: completionDate.date.start};
        }
    }
    else {
        const createdTimeObj = new Date(createdTime);
        completionDate.date = null;
        date.date = {start: getNextDate(createdTimeObj, 7)};
    }
    let updatedProperties: any = {};
    updatedProperties[DATE] = date;
    updatedProperties[COMPLETION_DATE] = completionDate;
    return updatedProperties;
}