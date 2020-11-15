var badgesDao = require('./../dao/badges-dao');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignGameweekStandingsBadges: async function(assignGameweekBadgesRequest) {
        let gameweek = assignGameweekBadgesRequest.gameweek;
        let leagueGameweekData = assignGameweekBadgesRequest.leagueGameweekData;
        let leagueDetails = leagueGameweekData.leagueDetails;
        let standings = leagueGameweekData.standings;

        // assign badges based on the standings at the end of the gameweek
        let standingsBadges = await this._assignGameweekStandingsBadges(leagueDetails, gameweek, standings);
        return {
            "success": true,
            "gameweek": gameweek
        }
    },

    _assignGameweekStandingsBadges: async function(leagueDetails, gameweek, standings) {
        let weeklyWinners = [];
        let weeklyLosers = [];
        let mostPoints = 0;
        let leastPoints = 500;
        let gameweekFirstPlace = undefined;
        let gameweekLastPlace = undefined;
        for (let i in standings) {
            let standing = standings[i];
            // Weekly Winners
            if (standing.event_total > mostPoints) {
                weeklyWinners = [standing.league_entry];
                mostPoints = standing.event_total
            } else if (standing.eventTotal === mostPoints) {
                weeklyWinners.push(standing.league_entry);
            } else {
                console.log("sucks to suck mate, you don't have good points");
            }

            // Weekly Losers
            if (standing.event_total < leastPoints) {
                weeklyLosers = [standing.league_entry];
                leastPoints = standing.event_total;
            } else if (standing.eventTotal === leastPoints) {
                weeklyLosers.push(standing.league_entry);
            } else {
                console.log("I guess you have okay points")
            }

            // First Place After Gameweek
            if (standing.rank === 1) {
                gameweekFirstPlace = standing.league_entry
            }
            // Last Place After Gameweek
            if (standing.rank === standings.length) {
                gameweekLastPlace = standing.league_entry
            }
            // 50+ Point Gameweek
            let fiftyPlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, gameweek, BADGE_TYPE._50_POINT_GAMEWEEK, 50, "gte");
            // 75+ Point Gameweek
            let seventyFivePlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, gameweek, BADGE_TYPE._75_POINT_GAMEWEEK, 75, "gte");
            // 100+ Point Gameweek
            let oneHundredPlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, gameweek, BADGE_TYPE._100_POINT_GAMEWEEK, 100, "gte");
        }
        console.log("Gameweek winners: " + weeklyWinners + " with points: " + mostPoints);
        console.log("Gameweek losers: " + weeklyLosers + " with points: " + leastPoints);

        // Weekly Winners
        for (let i in weeklyWinners) {
            let entryId = weeklyWinners[i];
            let weeklyWinnerResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + entryId.toString() + "-" + BADGE_TYPE.GAMEWEEK_WINNER + "-" + gameweek,
                entryId.toString(),
                BADGE_TYPE.GAMEWEEK_WINNER, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - Gameweek " + gameweek + ": " + mostPoints,
                    "points": mostPoints
                },
                leagueDetails);
        }

        // Weekly Losers
        for (let i in weeklyLosers) {
            let entryId = weeklyLosers[i];
            let weeklyLoserResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + entryId.toString() + "-" + BADGE_TYPE.GAMEWEEK_LOSER + "-" + gameweek,
                entryId.toString(),
                BADGE_TYPE.GAMEWEEK_LOSER, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - Gameweek " + gameweek + ": " + leastPoints,
                    "points": leastPoints
                },
                leagueDetails);
        }

        // League Leader
        let leagueLeaderResponse = await badgesDao.addNewBadge(
            leagueDetails.league.id.toString() + "-" + gameweekFirstPlace.toString() + "-" + BADGE_TYPE.LEAGUE_LEADER + "-" + gameweek,
            gameweekFirstPlace.toString(),
            BADGE_TYPE.LEAGUE_LEADER,
            {
                "year": leagueDetails.league.draft_dt.substring(0, 4),
                "gameweek": gameweek
            },
            leagueDetails);

        // Gameweek Last Place
        if (gameweekLastPlace) {
            let leagueLoserResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + gameweekLastPlace.toString() + "-" + BADGE_TYPE.LEAGUE_LOSER + "-" + gameweek,
                gameweekLastPlace.toString(),
                BADGE_TYPE.LEAGUE_LOSER, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek
                },
                leagueDetails);
        }
    },

    _badgePointBasedGameweekBadge: async function(standing, leagueDetails, gameweek, badgeType, points, operation){
        if (operation === "gte" && standing.event_total >= points){
            console.log("Found " + operation + "-" + points.toString() + " gameweek for player: " + standing.league_entry.toString());
            let gameweekPointBadge = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + standing.league_entry.toString() + "-" + badgeType + "-" + gameweek,
                standing.league_entry.toString(),
                badgeType, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - Gameweek " + gameweek + ": " + standing.event_total,
                    "points": standing.event_total
                },
                leagueDetails);
        }
    }

}