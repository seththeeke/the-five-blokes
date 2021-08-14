import requests
import os
import json

class FantasySessions:
    def __init__(self):
        pass

    def get_session(self):
        print("Fetching fantasy league session...")
        session = requests.Session()
        url = 'https://users.premierleague.com/accounts/login/'
        payload = {
            'password': os.environ['FANTASY_PASSWORD'],
            'login': os.environ['FANTASY_USERNAME'],
            'redirect_uri': 'https://fantasy.premierleague.com/a/login',
            'app': 'plfpl-web'
        }
        session.post(url, data=payload)
        return session