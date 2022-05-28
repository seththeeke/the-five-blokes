var badgesDao = require('./../dao/badges-dao');
var BADGE_TYPE = require('./../util/badge-type');
var gameweeksDao = require('./../dao/gameweeks-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksPlayerHistoryDao = require('./../dao/gameweek-player-history-dao');

module.exports = {

    /**
     * Need to re-implement this entirely
     */
    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(leagueDetails);
        let playerHistoryForGameweek = await gameweeksPlayerHistoryDao.getGameweekPlayerDataForGameweek(assignSeasonBadgesRequest.leagueId, lastCompletedGameweek.gameweek.N.toString());
        let participants = JSON.parse(leagueDetails.participants.S);

        let mostGoals = {
            teamId: "",
            value: -1
        }
        let mostAssists = {
            teamId: "",
            value: -1
        }
        let mostCleanSheets = {
            teamId: "",
            value: -1
        }
        let mostYellowCards = {
            teamId: "",
            value: -1
        }
        let mostRedCards = {
            teamId: "",
            value: -1
        }
        let mostBonusPoints = {
            teamId: "",
            value: -1
        }
        let playerStatisticsMap = {};
        for (let i in playerHistoryForGameweek) {
            let gameweekPlayerData = playerHistoryForGameweek[i];
            let teamId = gameweekPlayerData.leagueIdTeamId.S.substring(gameweekPlayerData.leagueIdTeamId.S.indexOf("-") + 1);
            console.log("TeamId " + teamId);
            let playerPicks = JSON.parse(gameweekPlayerData.picks.S);

            playerStatisticsMap[teamId] = {
                "points": 0,
                "yellowCards": 0,
                "redCards": 0,
                "goals": 0,
                "assists": 0,
                "bonesPointsEarned": 0,
                "cleanSheets": 0
            };
            for (let j in playerPicks){
                let player = playerPicks[j];
                // let playerSummary = await premiereLeagueDataDao.getPlayerSeasonSummary(leagueDetails.year.S + "/" + ((parseInt(leagueDetails.year.S) + 1).toString()), player.element.toString());
                console.log(playerSummary);
                if (playerSummary.player_id) {
                    playerStatisticsMap[teamId].points = playerStatisticsMap[teamId].points + parseInt(playerSummary.total_points);
                    playerStatisticsMap[teamId].yellowCards = playerStatisticsMap[teamId].yellowCards + parseInt(playerSummary.total_yellow_cards);
                    playerStatisticsMap[teamId].redCards = playerStatisticsMap[teamId].redCards + parseInt(playerSummary.total_red_cards);
                    playerStatisticsMap[teamId].goals = playerStatisticsMap[teamId].goals + parseInt(playerSummary.total_goals);
                    playerStatisticsMap[teamId].assists = playerStatisticsMap[teamId].assists + parseInt(playerSummary.total_assists);
                    playerStatisticsMap[teamId].bonesPointsEarned = playerStatisticsMap[teamId].bonesPointsEarned + parseInt(playerSummary.total_bonus);
                    playerStatisticsMap[teamId].cleanSheets = playerStatisticsMap[teamId].cleanSheets + parseInt(playerSummary.total_clean_sheets);

                    if (playerStatisticsMap[teamId].goals > mostGoals.value){
                        mostGoals.teamId = teamId;
                        mostGoals.value = playerStatisticsMap[teamId].goals
                    }
                    if (playerStatisticsMap[teamId].assists > mostAssists.value){
                        mostAssists.teamId = teamId;
                        mostAssists.value = playerStatisticsMap[teamId].assists
                    }
                    if (playerStatisticsMap[teamId].cleanSheets > mostCleanSheets.value){
                        mostCleanSheets.teamId = teamId;
                        mostCleanSheets.value = playerStatisticsMap[teamId].cleanSheets
                    }
                    if (playerStatisticsMap[teamId].yellowCards > mostYellowCards.value){
                        mostYellowCards.teamId = teamId;
                        mostYellowCards.value = playerStatisticsMap[teamId].yellowCards
                    }
                    if (playerStatisticsMap[teamId].redCards > mostRedCards.value){
                        mostRedCards.teamId = teamId;
                        mostRedCards.value = playerStatisticsMap[teamId].redCards
                    }
                    if (playerStatisticsMap[teamId].bonesPointsEarned > mostBonusPoints.value){
                        mostBonusPoints.teamId = teamId;
                        mostBonusPoints.value = playerStatisticsMap[teamId].bonesPointsEarned
                    }
                } else {
                    console.log("Player with foreign_id " + player.element.toString() + " was not found in database");
                }
            }
        }

        let mostGoalsBadge = await this._assignBadge(mostGoals, BADGE_TYPE.MOST_GOALS, participants, leagueDetails);
        let mostAssistsBadge = await this._assignBadge(mostAssists, BADGE_TYPE.MOST_ASSISTS, participants, leagueDetails);
        let mostCleanSheetsBadge = await this._assignBadge(mostCleanSheets, BADGE_TYPE.MOST_CLEAN_SHEETS, participants, leagueDetails);
        let mostYellowCardsBadge = await this._assignBadge(mostYellowCards, BADGE_TYPE.MOST_YELLOW_CARDS, participants, leagueDetails);
        let mostRedCardsBadge = await this._assignBadge(mostRedCards, BADGE_TYPE.MOST_RED_CARDS, participants, leagueDetails);
        let mostBonusPointsBadge = await this._assignBadge(mostBonusPoints, BADGE_TYPE.MOST_BONUS_POINTS, participants, leagueDetails);

        return {
            "success": true,
        }
    },

    _assignBadge: async function(winner, badgeType, participants, leagueDetails){
        let entry = participants.filter(participant => participant.entry_id.toString() === winner.teamId.toString())[0];
        let badge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S + "-" + badgeType,
            entry.id.toString(),
            badgeType,
            {
                "year": leagueDetails.year.S,
                "value": winner.value
            },
            participants
        );
    }
}