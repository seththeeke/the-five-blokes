import requests
from dao.picks import DraftPicksDao

class DraftPicksService:
    def __init__(self, session):
        self._session = session

    def store_draft_picks(self, league_id):
        print("Storing draft picks")
        draft_picks = self._session.get('https://draft.premierleague.com/api/draft/' + league_id + '/choices')
        bootstrap_static = requests.get('https://draft.premierleague.com/api/bootstrap-static')
        elements = bootstrap_static.json()["elements"]
        teams = bootstrap_static.json()["teams"]
        draftPicksDao = DraftPicksDao()
        choices_with_metadata = []
        for choice in draft_picks.json()["choices"]:
            print(choice)
            elementId = choice["element"]
            for element in elements:
                if element["id"] == elementId:
                    choice["player_first_name"] = element["first_name"]
                    choice["player_last_name"] = element["second_name"]
                    choice["draft_rank"] = element["draft_rank"]
                    choice["element_type"] = element["element_type"]
                    choice["team_id"] = element["team"]
                    choice["team_name"] = self._get_team_name(element["team"], teams)
                    choice["league_id"] = str(league_id)
                    choice["id"] = str(choice["id"])
                    draftPicksDao.upsert_draft_pick(choice)
        return choices_with_metadata
        
    def _get_team_name(self, team_id, teams):
        for team in teams:
            if team["id"] == team_id:
                return team["name"]
        return "Team Not Found"