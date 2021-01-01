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

        let statisticsMap = {};
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            statisticsMap[teamId] = {
                "yellowCards": 0,
                "redCards": 0,
                "goals": 0,
                "goalsConceded": 0,
                "assists": 0,
                "penaltiesMissed": 0,
                "penaltiesSaved": 0,
                "bonesPointsEarned": 0,
                "cleanSheets": 0
            };
            for (let i in picks){
                let seasonPlayerData = await fplDraftService.getElementSummary(picks[i].element.id.toString());
                console.log(JSON.stringify(seasonPlayerData));
                // need to iterate over the 
                // statisticsMap[teamId].yellowCards = statisticsMap[teamId].yellowCards + player.yellow_cards;
                // statisticsMap[teamId].redCards = statisticsMap[teamId].redCards + player.red_cards;
                // statisticsMap[teamId].goals = statisticsMap[teamId].goals + player.goals_scored;
                // statisticsMap[teamId].goalsConceded = statisticsMap[teamId].goalsConceded + player.goals_conceded;
                // statisticsMap[teamId].assists = statisticsMap[teamId].assists + player.assists;
                // statisticsMap[teamId].penaltiesMissed = statisticsMap[teamId].penaltiesMissed + player.penalties_missed;
                // statisticsMap[teamId].penaltiesSaved = statisticsMap[teamId].penaltiesSaved + player.penalties_saved;
                // statisticsMap[teamId].bonesPointsEarned = statisticsMap[teamId].bonesPointsEarned + player.bonus;
                // statisticsMap[teamId].cleanSheets = statisticsMap[teamId].cleanSheets + player.clean_sheets;
            }
        }

        // get all players for team
        // get the sum of the various stats for each player
        // get the sum of the sums from the players
        // determine who has the highest value for each stat
        // May be more efficient to query all player fixtures for the season??? Can a lambda hold all that in memory???
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