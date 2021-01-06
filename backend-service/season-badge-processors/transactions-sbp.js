var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var fplDraftService = require('./../services/fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');
var badgeProcessorUtil = require('./../util/badge-processor-util');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        // let filteredPlayers = await staticContentDao.getStaticContent(assignSeasonBadgesRequest.filteredPlayerDataKey);
        // let leagueGameweekData = assignSeasonBadgesRequest.leagueGameweekData;
        // let leaguePicks = assignSeasonBadgesRequest.leaguePicks;
        // let gameweek = assignSeasonBadgesRequest.gameweek;
        // let playerMap = badgeProcessorUtil.createPlayerMap(filteredPlayers);
        // let leagueDetails = leagueGameweekData.leagueDetails;

        // query sum of transactions grouped by participant from ddb
        // Most Transactions
        // Most Transactions Denied

        return {
            "success": true,
            // "gameweek": gameweek
        }
    }
}