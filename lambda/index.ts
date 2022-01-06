import {Client} from "@notionhq/client/build/src";
import {DatePropertyValue, MultiSelectPropertyValue, SelectPropertyValue} from "@notionhq/client/build/src/api-types";
import spacetime from "spacetime";
import {moveRecurringTasksToNotStarted} from "./recurring";
import {setCompleted} from "./completed";
import {setNotCompleted} from "./not_completed";


const auth = process.env.NOTION_AUTH;
const kataban_board = process.env.NOTION_KATABAN_BOARD;
const not_started = process.env.NOTION_NOT_STARTED_LABEL;
const completed_label = process.env.NOTION_COMPLETED_LABEL;
const notion = new Client({
    auth
});

const notionArgs = {notion, kataban_board, not_started, completed_label}
export const handler = async () => {
    await moveRecurringTasksToNotStarted(notionArgs);
    await setCompleted(notionArgs);
    await setNotCompleted(notionArgs);
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
