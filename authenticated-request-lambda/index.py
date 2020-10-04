import requests
import os
import json

# Taken from https://medium.com/@bram.vanherle1/fantasy-premier-league-api-authentication-guide-2f7aeb2382e4
# Start of the authenticated request lambda, not currently needed
def handler(event, context):
    leagueId = event["leagueId"]
    gameweek = event["gameweek"]
    api = event["api"]
    session = requests.Session()
    url = 'https://users.premierleague.com/accounts/login/'
    payload = {
    'password': os.environ['PASSWORD'],
    'login': os.environ['USERNAME'],
    'redirect_uri': 'https://fantasy.premierleague.com/a/login',
    'app': 'plfpl-web'
    }
    session.post(url, data=payload)
    if api == "teams":
        teamIds = event["teamIds"]
        allTeamInfo = {}
        for teamId in teamIds:
            teamResponse = session.get('https://draft.premierleague.com/api/entry/' + str(teamId) + '/my-team')
            allTeamInfo[str(teamId)] = teamResponse.json()
        # response = session.get('https://draft.premierleague.com/api/entry/38762/my-team')
        return allTeamInfo
    elif api == "choices":
        response = session.get('https://draft.premierleague.com/api/draft/' + leagueId + '/choices')
        return response.json()
    else:
        print ("Unsupported api choice " + api)

    return ""