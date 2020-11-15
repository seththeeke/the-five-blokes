var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignGameweekPlayerStatBadges: async function(assignGameweekBadgesRequest) {
        let filteredPlayers = await staticContentDao.getStaticContent(assignGameweekBadgesRequest.filteredPlayerDataKey);
        let gameweekData = assignGameweekBadgesRequest.gameweekData;
        let leagueGameweekData = assignGameweekBadgesRequest.leagueGameweekData;
        let leaguePicks = assignGameweekBadgesRequest.leaguePicks;
        let gameweek = assignGameweekBadgesRequest.gameweek;
        let playerMap = {};
        for (let k in filteredPlayers){
            let player = filteredPlayers[k];
            playerMap[player.id.toString()] = player;
        }

        let gameweekPlayerData = gameweekData.gameweekPlayerData;
        let leagueDetails = leagueGameweekData.leagueDetails;

        // award badges based on the player statistics for points, goals, assists, and aggregations
        let gameweekPlayerBadges = await this._assignGameweekPlayerStatBadges(leagueDetails, gameweek, leaguePicks, playerMap, gameweekPlayerData);
        return {
            "success": true,
            "gameweek": gameweek
        }
    },

    _assignGameweekPlayerStatBadges: async function(leagueDetails, gameweek, leaguePicks, playerMap, gameweekPlayerData) {
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            let totalGoals = 0;
            let totalAssists = 0;
            for (let i in picks){
                let player = playerMap[picks[i].element.toString()];
                if (player){
                    // Negative Gameweek Player
                    let negativeGameweekPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, BADGE_TYPE.NEGATIVE_GAMEWEEK_PLAYER, 0, "lt", gameweek, "starter");
                    // 15+ Point Gameweek Player
                    let fifteenPointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, BADGE_TYPE._15_POINT_GAMEWEEK_PLAYER, 15, "gte", gameweek, "starter");
                    // 20+ Point Gameweek Player
                    let twentyPointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, BADGE_TYPE._20_POINT_GAMEWEEK_PLAYER, 20, "gte", gameweek, "starter");
                    // 25+ Point Gameweek Player
                    let twentyFivePointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, BADGE_TYPE._25_POINT_GAMEWEEK_PLAYER, 25, "gte", gameweek, "starter");
                    // 10+ Point Bench Player
                    let tenPointBenchPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, BADGE_TYPE._10_POINT_BENCH_PLAYER, 10, "gte", gameweek, "bench");
                    // Count Goals
                    let gameweekDataForPlayer = gameweekPlayerData[player.id.toString()]
                    if (gameweekDataForPlayer && picks[i].position < 12){
                        if (gameweekDataForPlayer.goals_scored){
                            totalGoals = totalGoals + parseInt(gameweekDataForPlayer.goals_scored);
                        }
                        if (gameweekDataForPlayer.assists){
                            totalAssists = totalAssists + parseInt(gameweekDataForPlayer.assists);
                        }
                    }
                }
            }
            let fifteenGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 15, leagueDetails, teamId, gameweek, BADGE_TYPE._15_GOAL_GAMEWEEK);
            let tenGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 10, leagueDetails, teamId, gameweek, BADGE_TYPE._10_GOAL_GAMEWEEK);
            let fiveGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 5, leagueDetails, teamId, gameweek, BADGE_TYPE._5_GOAL_GAMEWEEK);
            let zeroGoalBadge = await this._badgeBasedOnValue(totalGoals, "eq", 0, leagueDetails, teamId, gameweek, BADGE_TYPE._0_GOAL_GAMEWEEK);
            let fifteenAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 15, leagueDetails, teamId, gameweek, BADGE_TYPE._15_ASSIST_GAMEWEEK);
            let tenAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 10, leagueDetails, teamId, gameweek, BADGE_TYPE._10_ASSIST_GAMEWEEK);
            let fiveAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 5, leagueDetails, teamId, gameweek, BADGE_TYPE._5_ASSIST_GAMEWEEK);
            let zeroAssistBadge = await this._badgeBasedOnValue(totalAssists, "eq", 0, leagueDetails, teamId, gameweek, BADGE_TYPE._0_ASSIST_GAMEWEEK);
        }
    },

    _badgeBasedOnValue: async function(value, operation, threshold, leagueDetails, teamId, gameweek, badgeType){
        if ((operation === "eq" && value == threshold) ||
            (operation === "gte" && value >= threshold)){
            let leagueEntry = leagueDetails.league_entries.filter(leagueEntry => leagueEntry.entry_id.toString() === teamId.toString());
            let tenGoalBadge = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-" + badgeType + "-" + gameweek,
                leagueEntry[0].id.toString(),
                badgeType, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "value": value
                },
                leagueDetails);
        }
    },

    _badgePlayerPointBasedGameweekBadge: async function(player, pick, teamId, leagueDetails, badgeType, points, operation, gameweek, playerPosition){
        if (((playerPosition === "starter" && pick.position < 12) ||
            (playerPosition === "bench" && pick.position > 11)) &&
            (operation === "gte" && player.event_points >= points) ||
            (operation === "lt" && player.event_points < points)) {
            console.log("Found " + operation + "-" + points.toString() + " gameweek player for teamId: " + teamId);
            let leagueEntry = leagueDetails.league_entries.filter(leagueEntry => leagueEntry.entry_id.toString() === teamId.toString());
            let playerBadge = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-" + badgeType + "-" + gameweek,
                leagueEntry[0].id.toString(),
                badgeType, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "player": player
                },
                leagueDetails);
        }
    }
}