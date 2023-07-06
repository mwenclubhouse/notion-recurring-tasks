import {Client} from "@notionhq/client";
import {moveRecurringTasksToNotStarted} from "./recurring";
import {setCompleted} from "./completed";
import {setNotCompleted} from "./not_completed";
import { getDate } from "./utils";


const kataban_board = process.env.NOTION_KATABAN_BOARD;
const not_started = process.env.NOTION_NOT_STARTED_LABEL;
const completed_label = process.env.NOTION_COMPLETED_LABEL;
const notion = new Client({
    auth: process.env.NOTION_AUTH
});

const notionArgs = {notion, kataban_board, not_started, completed_label}
export const handler = async () => {
    await moveRecurringTasksToNotStarted(notionArgs);
    await setCompleted(notionArgs);
    console.log("finished: ", getDate());
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
