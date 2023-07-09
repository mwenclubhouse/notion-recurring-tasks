import { Client } from "@notionhq/client";
import { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export interface NotionArgs {
    notion: Client,
    katabanBoard: string,
    notStarted: string, 
    completedLabel: string
}

export interface GetItemsArgs {
    notion: Client,
    katabanBoard: string,
    filter: any
}

export type NotionItem = PageObjectResponse;