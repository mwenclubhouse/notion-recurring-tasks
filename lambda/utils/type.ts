import { Client } from "@notionhq/client";
import { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export interface NotionArgs {
    notion: Client,
    katabanId: string,
    notStarted: string, 
    completedLabel: string
}

export interface GetItemsArgs {
    notion: Client,
    katabanId: string,
    filter: any
}

export type NotionItem = PageObjectResponse;