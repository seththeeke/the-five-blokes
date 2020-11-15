var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var fplDraftService = require('./../services/fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignGameweekMVPBadge: async function(assignGameweekBadgesRequest) {
        let filteredPlayers = await staticContentDao.getStaticContent(assignGameweekBadgesRequest.filteredPlayerDataKey);
        let leagueGameweekData = assignGameweekBadgesRequest.leagueGameweekData;
        let leaguePicks = assignGameweekBadgesRequest.leaguePicks;
        let gameweek = assignGameweekBadgesRequest.gameweek;
        let playerMap = {};
        for (let k in filteredPlayers){
            let player = filteredPlayers[k];
            playerMap[player.id.toString()] = player;
        }

        let leagueDetails = leagueGameweekData.leagueDetails;

        // assign badge to the player who owns the MVP of the gameweek, if any
        let weeklyMVP = await this._assignGameweekMVPBadge(leagueDetails, gameweek, leaguePicks, playerMap);
        return {
            "success": true,
            "gameweek": gameweek
        }
    },

    _assignGameweekMVPBadge: async function(leagueDetails, gameweek, leaguePicks, playerMap){
        let topElementsResponse = await fplDraftService.getTopPlayers();
        let topPlayer = topElementsResponse.data[gameweek.toString()];
        let topTeam = undefined;
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            if (!topTeam){
                for (let i in picks){
                    if (!topTeam && picks[i].element === topPlayer.element){
                        topTeam = teamId;
                    }
                }
            }
        }
        console.log("Found top team: " + topTeam + " for player: " + topPlayer.element);
        let leagueEntry = leagueDetails.league_entries.filter(leagueEntry => leagueEntry.entry_id.toString() === topTeam.toString());
        if (leagueEntry[0]) {
            let gameweekMVP = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-" + BADGE_TYPE.GAMEWEEK_MVP + "-" + gameweek,
                leagueEntry[0].id.toString(),
                BADGE_TYPE.GAMEWEEK_MVP, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "player": playerMap[topPlayer.element.toString()]
                },
                leagueDetails);
        } else {
            console.log("No participant owned the top player for gameweek: " + gameweek);
        }
    }
}