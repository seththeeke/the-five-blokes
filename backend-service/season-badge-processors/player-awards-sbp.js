var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var BADGE_TYPE = require('./../util/badge-type');
var statisticsCalculator = require('./../util/statistics-calculator');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweekPlayerHistoryDao = require('./../dao/gameweek-player-history-dao');
var premiereLeagueDataDao = require('./../dao/premiere-league-data-dao');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let gameweekWhenCompleted = assignSeasonBadgesRequest.gameweek;
        let gameweekPlayerHistory = await gameweekPlayerHistoryDao.getGameweekPlayerDataForGameweek(assignSeasonBadgesRequest.leagueId, gameweekWhenCompleted);

        let topTenScorers = await premiereLeagueDataDao.getTopPlayersByStatistic("goals", "2020/2021");
        let topTenAssisters = await premiereLeagueDataDao.getTopPlayersByStatistic("assists", "2020/2021");
        let topTenCleanSheets = await premiereLeagueDataDao.getTopPlayersByStatistic("clean_sheets", "2020/2021", 1);
        // // get all players with dreamteam set to true from rds
        // let dreamTeam = statisticsCalculator.getDreamTeamPlayers(filteredPlayers);
        let goldenBootWinner = topTenScorers[0];
        let playmakerOfTheSeasonWinner = topTenAssisters[0];
        let goldenGloveWinner = topTenCleanSheets[0];

        let playerIdToTeamId = {};
        for (let i in gameweekPlayerHistory) {
            let playerInfo = gameweekPlayerHistory[i];
            let teamId = playerInfo.leagueIdTeamId.S.substring(playerInfo.leagueIdTeamId.S.indexOf("-") + 1);
            let picksForTeam = JSON.parse(playerInfo.picks.S);
            for (let j in picksForTeam) {
                playerIdToTeamId[picksForTeam[j].element.toString()] = teamId;
            }
        }

        let badges = [];
        badges.push({
            "teamId": playerIdToTeamId[goldenBootWinner.foreign_id.toString()],
            "player": goldenBootWinner,
            "badgeType": BADGE_TYPE.GOLDEN_BOOT,
            "value": goldenBootWinner.total
        });
        badges.push({
            "teamId": playerIdToTeamId[playmakerOfTheSeasonWinner.foreign_id.toString()],
            "player": playmakerOfTheSeasonWinner,
            "badgeType": BADGE_TYPE.PLAYMAKER_OF_THE_SEASON_WINNER,
            "value": playmakerOfTheSeasonWinner.total
        });
        badges.push({
            "teamId": playerIdToTeamId[goldenGloveWinner.foreign_id.toString()],
            "player": goldenGloveWinner,
            "badgeType": BADGE_TYPE.GOLDEN_GLOVE,
            "value": goldenBootWinner.total
        });
        // for (let i in dreamTeam) {
        //     let dreamTeamPlayer = dreamTeam[i];
        //     let teamId = badgeProcessorUtil.getTeamIdForPlayer(leaguePicks, dreamTeamPlayer, playerMap);
        //     if (teamId){
        //         badges.push({
        //             teamId,
        //             "player": dreamTeamPlayer,
        //             "badgeType": BADGE_TYPE.DREAM_TEAM_PLAYER,
        //             "value": dreamTeamPlayer.total_points
        //         });
        //     } else {
        //         console.log("No player owns dreamteam player with id: " + dreamTeamPlayer.id);
        //     }
        // }

        // Iterate through badge array and award badges
        for (let j in badges) {
            let badge = badges[j];
            if (badge.teamId && badge.player){
                let playerBadge = await this._badgePlayerWithValue(badge.value, badge.player, leagueDetails, badge.teamId, badge.badgeType);
            }
        }

        return {
            "success": true,
            "gameweek": gameweekWhenCompleted
        }
    },

    _badgePlayerWithValue: async function(value, player, leagueDetails, teamId, badgeType){
        let participants = JSON.parse(leagueDetails.participants.S);
        // leagueEntry is currently coming back null/empty, need to figure out mapping participant and teamId
        let leagueEntry = participants.filter(participant => participant.entry_id.toString() === teamId.toString());
        let playerBadge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.league.id.toString() + "-" + leagueEntry.id.toString() + "-" + badgeType + "-" + player.id.toString(),
            leagueEntry.id.toString(),
            badgeType, 
            {
                "year": leagueDetails.league.draft_dt.substring(0, 4),
                "value": value,
                "player": player
            },
            JSON.parse(leagueDetails.participants.S));
        return playerBadge;
    }
}