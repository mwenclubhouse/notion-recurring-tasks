# Notion Recurring Tasks

## Description
Handling tasks the repeat on specific days. 

## Motivation
In Notion's Kataban Board, there isn't a way for you to repeat a task if you have a task that reoccurs every Monday, Wednesday, and Friday. 
This program does that automatically. When you move your task to a completed section, it will automatically change the date, and move the task
back to not started. Yeah, pretty nifty. 

## Environment Variables
For Me, Put this in a env file: (example) /home/mwenclubhouse/environments/notion.env.list
```text
NOTION_AUTH=[Authentication for Notion Board]
NOTION_KATABAN_BOARD=[ID of Kataban Board Used]
NOTION_NOT_STARTED_LABEL=[Name of the Not Started Label ex. 1. Not Started]
NOTION_COMPLETED_LABEL=[Name of Completed Label ex. 4. Completed]
IS_EC2_INSTANCE=[yes if running on GCP compute engine or AWS EC2, no for AWS Lambda (so far)]
```

## Notion Setup for Kataban Board
1. Recurring Days: Multiselect with "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
2. Status: Select with at least NOTION_COMPLETED_LABEL as an option
3. Date: Date that contains the Due Date of a task
4. Completion Date: Date that contains the Completion Date

## Running Docker Container
```bash
$ sudo docker pull ghcr.io/mwenclubhouse/notion-recurring-tasks:main
$ sudo docker run -d --env-file /home/mwenclubhouse/environments/notion.env.list \
       --name notion \
       --restart always \
       ghcr.io/mwenclubhouse/notion-recurring-tasks:main
```
