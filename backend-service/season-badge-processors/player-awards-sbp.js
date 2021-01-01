var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var BADGE_TYPE = require('./../util/badge-type');
var badgeProcessorUtil = require('./../util/badge-processor-util');
var statisticsCalculator = require('./../util/statistics-calculator');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let filteredPlayers = await staticContentDao.getStaticContent(assignSeasonBadgesRequest.filteredPlayerDataKey);
        let leagueGameweekData = assignSeasonBadgesRequest.leagueGameweekData;
        let leaguePicks = assignSeasonBadgesRequest.leaguePicks;
        let gameweek = assignSeasonBadgesRequest.gameweek;
        let playerMap = badgeProcessorUtil.createPlayerMap(filteredPlayers);
        let leagueDetails = leagueGameweekData.leagueDetails;

        // get top ten goal scorers from rds
        let topTenScorers = statisticsCalculator.getTopTenScorers(filteredPlayers);
        // get top ten assists from rds
        let topTenAssisters = statisticsCalculator.getTopTenAssisters(filteredPlayers);
        // get top ten clean sheets from rds where position = 0
        let topTenCleanSheets = statisticsCalculator.getTopTenCleanSheets(filteredPlayers);
        // get all players with dreamteam set to true from rds
        let dreamTeam = statisticsCalculator.getDreamTeamPlayers(filteredPlayers);
        let goldenBootWinner = topTenScorers[0];
        let playmakerOfTheSeasonWinner = topTenAssisters[0];
        let goldenGloveWinner = topTenCleanSheets[0];

        let badges = [];
        badges.push({
            "teamId": badgeProcessorUtil.getTeamIdForPlayer(leaguePicks, goldenBootWinner, playerMap),
            "player": goldenBootWinner,
            "badgeType": BADGE_TYPE.GOLDEN_BOOT,
            "value": goldenBootWinner.goals_scored
        });
        badges.push({
            "teamId": badgeProcessorUtil.getTeamIdForPlayer(leaguePicks, playmakerOfTheSeasonWinner, playerMap),
            "player": playmakerOfTheSeasonWinner,
            "badgeType": BADGE_TYPE.PLAYMAKER_OF_THE_SEASON_WINNER,
            "value": playmakerOfTheSeasonWinner.assists
        });
        badges.push({
            "teamId": badgeProcessorUtil.getTeamIdForPlayer(leaguePicks, goldenGloveWinner, playerMap),
            "player": goldenGloveWinner,
            "badgeType": BADGE_TYPE.GOLDEN_GLOVE,
            "value": goldenBootWinner.clean_sheets
        });
        for (let i in dreamTeam) {
            let dreamTeamPlayer = dreamTeam[i];
            let teamId = badgeProcessorUtil.getTeamIdForPlayer(leaguePicks, dreamTeamPlayer, playerMap);
            if (teamId){
                badges.push({
                    teamId,
                    "player": dreamTeamPlayer,
                    "badgeType": BADGE_TYPE.DREAM_TEAM_PLAYER,
                    "value": dreamTeamPlayer.total_points
                });
            } else {
                console.log("No player owns dreamteam player with id: " + dreamTeamPlayer.id);
            }
        }

        // Iterate through badge array and award badges
        for (let j in badges) {
            let badge = badges[j];
            if (badge.teamId && badge.player){
                let playerBadge = await this._badgePlayerWithValue(badge.value, badge.player, leagueDetails, badge.teamId, badge.badgeType);
            }
        }

        return {
            "success": true,
            "gameweek": gameweek
        }
    },

    _badgePlayerWithValue: async function(value, player, leagueDetails, teamId, badgeType){
        let leagueEntry = leagueDetails.league_entries.filter(leagueEntry => leagueEntry.entry_id.toString() === teamId.toString());
        let playerBadge = await badgesDao.addNewBadge(
            leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-" + badgeType + "-" + player.id.toString(),
            leagueEntry[0].id.toString(),
            badgeType, 
            {
                "year": leagueDetails.league.draft_dt.substring(0, 4),
                "value": value,
                "player": player
            },
            leagueDetails);
        return playerBadge;
    }
}