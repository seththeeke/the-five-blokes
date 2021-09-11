import requests

class LastOfTheMohigansService:
    def __init__(self, session):
        self._session = session

    def get_live_view(self, league_id):
        print("Fetching live view for leagueId: " + league_id)
        bootstrap_static = requests.get('https://draft.premierleague.com/api/bootstrap-static')
        element_data = bootstrap_static.json()["elements"]
        league_details = requests.get('https://draft.premierleague.com/api/league/' + str(league_id) + '/details')
        league_entries = league_details.json()["league_entries"]
        gameweek_metadata = requests.get('https://draft.premierleague.com/api/game')
        gameweek_live_data = requests.get('https://draft.premierleague.com/api/event/' + str(gameweek_metadata.json()["current_event"]) + '/live')
        live_view = {
            "teams": []
        }
        for team in league_entries:
            team_info = requests.get('https://draft.premierleague.com/api/entry/' + str(team["entry_id"])  + '/event/' + str(gameweek_metadata.json()["current_event"]))
            team_points = 0
            bench_points = 0
            starters_yet_to_play = []
            bench_yet_to_play = []
            starters_with_points = []
            bench_with_points = []
            picks = team_info.json()["picks"]
            for pick in picks:
                player_live_data = gameweek_live_data.json()["elements"][str(pick["element"])]
                player_points = player_live_data["stats"]["total_points"]
                player_minutes = player_live_data["stats"]["minutes"]
                player_info = element_data[pick["element"] - 1]
                if pick["position"] < 12:
                    team_points += player_points
                    if player_minutes <= 0:
                        starters_yet_to_play.append(player_info)
                    else:
                        starters_with_points.append({
                            "playerInfo": player_info,
                            "points": player_points
                        })
                else:
                    bench_points += player_points
                    if player_minutes <= 0:
                        bench_yet_to_play.append(player_info)
                    else:
                        bench_with_points.append({
                            "playerInfo": player_info,
                            "points": player_points
                        })
                pick["stats"] = player_live_data["stats"]
                pick["player_info"] = player_info
            live_view["teams"].append({
                "team_info": team,
                "gameweek_info": {
                    "team_points": team_points,
                    "bench_points": bench_points,
                    "starters_yet_to_play": starters_yet_to_play,
                    "bench_yet_to_play": bench_yet_to_play,
                    "starters_with_points": starters_with_points,
                    "bench_with_points": bench_with_points,
                    "picks": picks
                }
            })
        live_view["standings"] = league_details.json()["standings"]
        live_view["gameweekMetadata"] = gameweek_metadata.json()
        print("Successfully retrieved live view for leagueId " + league_id)
        return live_view