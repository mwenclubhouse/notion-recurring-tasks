import { Client } from "@notionhq/client";
import { moveRecurringTasksToNotStarted } from "./updates/recurring";
import { setCompleted } from "./updates/completed";
import { NotionArgs } from "./utils/type";
import { updateDateProperties } from "./updates/updateDateProperties";


const katabanBoard = process.env.NOTION_KATABAN_BOARD;
const notStarted = process.env.NOTION_NOT_STARTED_LABEL;
const completedLabel = process.env.NOTION_COMPLETED_LABEL;
const notion = new Client({
    auth: process.env.NOTION_AUTH
});

const notionArgs: NotionArgs = {
    notion, katabanBoard, notStarted, completedLabel
}

export const handler = async () => {
    try {
        await moveRecurringTasksToNotStarted(notionArgs);
    }
    catch (e) {
        console.log("Error Moving Tasks: ", e);
    }
    try {
        await setCompleted(notionArgs);
    }
    catch (e) {
        console.log("Error Setting Complete: ", e)
    }
    try {
        await updateDateProperties(notionArgs);
    }
    catch (e) {
        console.log("Error Updating Date Property: ", e);
    }
    console.log("Finished: ", (new Date()).toLocaleString());
}

const runAsync = () => {
    handler().then( () => {
        setTimeout(runAsync, 15000)
        }
    )
}
if (process.env.IS_EC2_INSTANCE) {
    runAsync();
}
