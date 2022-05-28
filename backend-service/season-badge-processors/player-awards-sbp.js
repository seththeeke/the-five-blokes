var badgesDao = require('./../dao/badges-dao');
var BADGE_TYPE = require('./../util/badge-type');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweekPlayerHistoryDao = require('./../dao/gameweek-player-history-dao');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let gameweekWhenCompleted = assignSeasonBadgesRequest.gameweek;
        let gameweekPlayerHistory = await gameweekPlayerHistoryDao.getGameweekPlayerDataForGameweek(assignSeasonBadgesRequest.leagueId, gameweekWhenCompleted);

        /* Need new way to get top players after removing RDS
        // let topTenScorers = await premiereLeagueDataDao.getTopPlayersByStatistic("goals", "2020/2021");
        // let topTenAssisters = await premiereLeagueDataDao.getTopPlayersByStatistic("assists", "2020/2021");
        // let topTenCleanSheets = await premiereLeagueDataDao.getTopPlayersByStatistic("clean_sheets", "2020/2021", 1);
        */

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

        // Iterate through badge array and award badges
        for (let j in badges) {
            let badge = badges[j];
            if (badge.teamId && badge.player){
                let playerBadge = await this._badgePlayerWithValue(badge.value, badge.player, leagueDetails, badge.teamId, badge.badgeType);
            } else {
                console.log("No one owned the player with the badgeType: " + badge.badgeType);
            }
        }

        return {
            "success": true,
            "gameweek": gameweekWhenCompleted
        }
    },

    _badgePlayerWithValue: async function(value, player, leagueDetails, teamId, badgeType){
        let participants = JSON.parse(leagueDetails.participants.S);
        let leagueEntry = participants.filter(participant => participant.entry_id.toString() === teamId.toString())[0];
        let playerBadge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S.toString() + "-" + leagueEntry.id.toString() + "-" + badgeType + "-" + player.foreign_id.toString(),
            leagueEntry.id.toString(),
            badgeType, 
            {
                "year": leagueDetails.year.S,
                "value": value,
                "player": player
            },
            JSON.parse(leagueDetails.participants.S));
        return playerBadge;
    }
}