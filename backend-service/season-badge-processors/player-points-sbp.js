var badgesDao = require('./../dao/badges-dao');
var BADGE_TYPE = require('./../util/badge-type');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweekPlayerHistoryDao = require('./../dao/gameweek-player-history-dao');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let gameweekWhenCompleted = assignSeasonBadgesRequest.gameweek;
        let gameweekPlayerHistory = await gameweekPlayerHistoryDao.getGameweekPlayerDataForGameweek(assignSeasonBadgesRequest.leagueId, gameweekWhenCompleted);

        let formattedYear = leagueDetails.year.S + "/" + (parseInt(leagueDetails.year.S) + 1);
        // limiting the point getters to top 100, don't think there will be more than 100 players with 200+ points, only 10 players at midpoint that have 100+ points
        
        /* Need a new way to get the top 100 point getters
        // let topPointGetters = await premiereLeagueDataDao.getTopPlayersByStatistic("points", formattedYear.toString(), -1, 100);
        */
        let playerMap = {};
        for (let i in topPointGetters){
            let player = topPointGetters[i];
            playerMap[player.foreign_id.toString()] = player;
        }

        let badges = [];
        let seasonMVP = topPointGetters[0];
        let playerIdToTeamId = {};
        for (let i in gameweekPlayerHistory) {
            let playerInfo = gameweekPlayerHistory[i];
            let teamId = playerInfo.leagueIdTeamId.S.substring(playerInfo.leagueIdTeamId.S.indexOf("-") + 1);
            let picksForTeam = JSON.parse(playerInfo.picks.S);
            for (let j in picksForTeam) {
                let player = picksForTeam[j];
                playerIdToTeamId[player.element.toString()] = teamId;
                let playerData = playerMap[player.element.toString()];
                if (playerData){
                    let points = playerData.total;
                    if (points >= 200){
                        badges.push({
                            "teamId": playerIdToTeamId[playerData.foreign_id.toString()],
                            "player": playerData,
                            "badgeType": BADGE_TYPE._200_POINT_SEASON_PLAYER,
                            "value": playerData.total
                        });
                    }
                    if (points >= 250){
                        badges.push({
                            "teamId": playerIdToTeamId[playerData.foreign_id.toString()],
                            "player": playerData,
                            "badgeType": BADGE_TYPE._250_POINT_SEASON_PLAYER,
                            "value": playerData.total
                        });
                    }
                    if (points >= 300){
                        badges.push({
                            "teamId": playerIdToTeamId[playerData.foreign_id.toString()],
                            "player": playerData,
                            "badgeType": BADGE_TYPE._300_POINT_SEASON_PLAYER,
                            "value": playerData.total
                        });
                    }
                }
            }
        }

        badges.push({
            "teamId": playerIdToTeamId[seasonMVP.foreign_id.toString()],
            "player": seasonMVP,
            "badgeType": BADGE_TYPE.SEASON_MVP,
            "value": seasonMVP.total
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