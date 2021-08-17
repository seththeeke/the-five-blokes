import boto3
import os

class DraftPicksDao:
    def __init__(self):
        pass

    def upsert_draft_pick(self, pick):
        print("persisting draft pick")
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['DRAFT_PICKS_TABLE_NAME'])
        response = table.put_item(
            Item=pick
        )
        return response