import requests
import os
import json
from services.sessions import FantasySessions
from services.picks import DraftPicksService
from services.lotm import LastOfTheMohigansService

# Taken from https://medium.com/@bram.vanherle1/fantasy-premier-league-api-authentication-guide-2f7aeb2382e4
def store_draft_picks_controller(event, context):
    leagueId = event["league"]
    fantasySessionService = FantasySessions()
    session = fantasySessionService.get_session()
    draftPicksService = DraftPicksService(session)
    response = draftPicksService.store_draft_picks(leagueId)
    return response

def get_live_view_controller(event, context):
    print(event)
    leagueId = event["queryStringParameters"]["leagueId"]
    fantasySessionService = FantasySessions()
    session = fantasySessionService.get_session()
    lastOfTheMohigansService = LastOfTheMohigansService(session)
    response = lastOfTheMohigansService.get_live_view(leagueId)
    return {
        "statusCode": 200,
        'body': json.dumps({
            'data': response
        }),
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    }