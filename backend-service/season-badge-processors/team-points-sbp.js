var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var fplDraftService = require('./../services/fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');
var badgeProcessorUtil = require('./../util/badge-processor-util');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let filteredPlayers = await staticContentDao.getStaticContent(assignSeasonBadgesRequest.filteredPlayerDataKey);
        let leagueGameweekData = assignSeasonBadgesRequest.leagueGameweekData;
        let leaguePicks = assignSeasonBadgesRequest.leaguePicks;
        let gameweek = assignSeasonBadgesRequest.gameweek;
        let playerMap = badgeProcessorUtil.createPlayerMap(filteredPlayers);
        let leagueDetails = leagueGameweekData.leagueDetails;

        // iterate league details standings and create badges
        // LeagueChampion - participant with the most total points
        // SeasonLoser - participant with the fewest total points
        // 1000 points - given to any participant who earns at least 1000 points
        // 1500 points - given to any participant who earns at least 1500 points
        // 2000 points - given to any participant who earns at least 2000 points

        return {
            "success": true,
            "gameweek": gameweek
        }
    }
}