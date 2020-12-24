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

        // MostYellowCards
        // MostRedCards
        // MostGoals
        // MostGoalsConceded
        // MostAssists
        // MostPenaltiesMissed
        // MostPenaltiesSaved
        // MostPenaltiesScored
        // MostBonusPointsEarned

        return {
            "success": true,
            "gameweek": gameweek
        }
    }
}