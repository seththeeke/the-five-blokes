var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var fplDraftService = require('./../services/fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignSeasonBadges: async function(assignGameweekBadgesRequest) {
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

        return {
            "success": true,
            "gameweek": gameweek
        }
    }
}