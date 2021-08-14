import requests
import os
import json
from services.sessions import FantasySessions
from services.picks import DraftPicksService

# Taken from https://medium.com/@bram.vanherle1/fantasy-premier-league-api-authentication-guide-2f7aeb2382e4
def store_draft_picks_controller(event, context):
    leagueId = event["league"]
    fantasySessionService = FantasySessions()
    session = fantasySessionService.get_session()
    draftPicksService = DraftPicksService(session)
    response = draftPicksService.store_draft_picks(leagueId)
    return response