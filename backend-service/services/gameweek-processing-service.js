var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
var badgesDao = require('./../dao/badges-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var staticContentDao = require('./../dao/static-content-dao');
var gameweekPlayerDataDao = require('./../dao/gameweek-player-history-dao');
var fplDraftService = require('./fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');

/**
 * All functions related to processing a particular gameweek, collecting data, normalizing, badging
 */
module.exports = {
    hasGameweekCompleted: async function(){
        console.log("Beginning to check if a gameweek has completed");
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);

        let gameweekMetadataResponse = await fplDraftService.getGameweekMetadata();
        let gameweekData = gameweekMetadataResponse.data;
        if (gameweekData.current_event_finished && (!lastCompletedGameweek || parseInt(gameweekData.current_event) > parseInt(lastCompletedGameweek.gameweek.N))) {
            console.log("New gameweek completed " + gameweekData);
            return {
                "gameweek": gameweekData.current_event.toString(),
                "league": activeLeague.leagueId.S,
                "hasCompleted": true
            }
        }
        console.log("No new gameweek information for league " + JSON.stringify(activeLeague));
        return {
            "gameweek": gameweekData.current_event.toString(),
            "league": activeLeague.leagueId.S,
            "hasCompleted": false
        }
    },

    extractGameweekData: async function(extractGameweekDataRequest){
        console.log("Beginning to extract data for gameweek: " + JSON.stringify(extractGameweekDataRequest));
        // fetch static content, persist and return a transformed list of player data for processing further
        let filteredPlayerDataKey = await this._fetchAndPersistStaticData(extractGameweekDataRequest.leagueId, extractGameweekDataRequest.gameweekNum);
        // fetch fixtures and build a map of player data based on the fixture results in the gameweek
        let gameweekData = await this._fetchGameweekData(extractGameweekDataRequest.gameweekNum);
        let gameweekFixtures = gameweekData.gameweekFixtures;
        let gameweekPlayerData = gameweekData.gameweekPlayerData;
        // fetch league details and persist the league state for the gameweek
        let leagueGameweekData = await this._fetchLeagueDetailsAndPersistGameweek(extractGameweekDataRequest.leagueId, extractGameweekDataRequest.gameweekNum, gameweekFixtures, gameweekPlayerData);
        let leagueDetails = leagueGameweekData.leagueDetails;
        // fetch teams for each participant for the gameweek and persist in history table
        let leaguePicks = await this._fetchAndPersistPlayerPicksForGameweek(leagueDetails, extractGameweekDataRequest.gameweekNum);

        return {
            "filteredPlayerDataKey": filteredPlayerDataKey,
            "gameweekData": gameweekData,
            "leagueGameweekData": leagueGameweekData,
            "leaguePicks": leaguePicks,
            "gameweek": extractGameweekDataRequest.gameweekNum
        };
    },

    assignGameweekBadges: async function(assignGameweekBadgesRequest) {
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
        let standings = leagueGameweekData.standings;

        // assign badges based on the standings at the end of the gameweek
        let standingsBadges = await this._assignGameweekStandingsBadges(leagueDetails, gameweek, standings);
        // assign badge to the player who owns the MVP of the gameweek, if any
        let weeklyMVP = await this._assignGameweekMVPBadge(leagueDetails, gameweek, leaguePicks, playerMap);
        // award badges based on the player statistics for points, goals, assists, and aggregations
        let gameweekPlayerBadges = await this._assignGameweekPlayerStatBadges(leagueDetails, gameweek, leaguePicks, playerMap, gameweekPlayerData);
        return {
            "success": true
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

    _assignGameweekMVPBadge: async function(leagueDetails, gameweek, leaguePicks, playerMap){
        let topElementsResponse = await fplDraftService.getTopPlayers();
        let topPlayer = topElementsResponse.data[gameweek.toString()];
        let topTeam = undefined;
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            if (!topTeam){
                for (let i in picks){
                    if (!topTeam && picks[i].element === topPlayer.element){
                        topTeam = teamId;
                    }
                }
            }
        }
        console.log("Found top team: " + topTeam + " for player: " + topPlayer.element);
        let leagueEntry = leagueDetails.league_entries.filter(leagueEntry => leagueEntry.entry_id.toString() === topTeam.toString());
        if (leagueEntry[0]) {
            let gameweekMVP = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-" + BADGE_TYPE.GAMEWEEK_MVP + "-" + gameweek,
                leagueEntry[0].id.toString(),
                BADGE_TYPE.GAMEWEEK_MVP, 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": gameweek,
                    "player": playerMap[topPlayer.element.toString()]
                },
                leagueDetails);
        } else {
            console.log("No participant owned the top player for gameweek: " + gameweek);
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

    _fetchAndPersistStaticData: async function(leagueId, gameweek){
        console.log("Fetching and persisting static content for leagueId: " + leagueId + " and gameweek: " + gameweek);
        let allSeasonDetailsResponse = await fplDraftService.getBootstapStatic();
        let allSeasonDetailsData = allSeasonDetailsResponse.data;
        let players = allSeasonDetailsData.elements;
        // filter out the players who haven't played, they are not relevant at this time.
        let filteredPlayers = players.filter(player => player.minutes > 0);
        let s3Response = await staticContentDao.putStaticContent(filteredPlayers, leagueId.toString() + "/" + gameweek.toString());
        // converting the players into a player map for easier lookup downstream
        
        // let playerMap = {};
        // for (let k in filteredPlayers){
        //     let player = filteredPlayers[k];
        //     playerMap[player.id.toString()] = player;
        // }
        // return playerMap;
        return leagueId.toString() + "/" + gameweek.toString();
    },

    _fetchGameweekData: async function(gameweek) {
        let gameweekFixturesResponse = await fplDraftService.getGameweekFixtures(gameweek.toString());
        let gameweekFixtures = gameweekFixturesResponse.data;
        // Map of player id to object containing goals, assists, bonus, bps, red cards, yellow cards, etc
        let gameweekPlayerData = {};
        // Iterate Fixtures
        for (let i in gameweekFixtures){
            let fixture = gameweekFixtures[i];
            let fixtureStats = fixture.stats;
            // Iterate stats in each fixture
            for (let j in fixtureStats) {
                let stat = fixtureStats[j];
                let key = stat.s;
                let stats = stat.h.concat(stat.a);
                // iterate each key in stats, goals, assists, etc
                for (let k in stats){
                    let playerStat = stats[k];
                    if (!gameweekPlayerData[playerStat.element.toString()]){
                        gameweekPlayerData[playerStat.element.toString()] = {};
                    }
                    // store in player data under the statistic key
                    let gameweekPlayer = gameweekPlayerData[playerStat.element.toString()];
                    gameweekPlayer[key] = playerStat.value;
                }
            }
        }
        return {
            gameweekFixtures,
            gameweekPlayerData
        }
    },

    _fetchLeagueDetailsAndPersistGameweek: async function(leagueId, gameweek, gameweekFixtures, gameweekPlayerData) {
        let response = await fplDraftService.getLeagueDetails(leagueId);
        let leagueDetails = response.data;
        let standings = leagueDetails.standings;
        let gameweekUpdateResponse = await gameweeksDao.putGameweek(leagueId, gameweek, standings, gameweekFixtures, gameweekPlayerData);
        return {
            leagueDetails,
            standings
        }
    },

    _fetchAndPersistPlayerPicksForGameweek: async function(leagueDetails, gameweek) {
        let leagueEntries = leagueDetails.league_entries;
        let leaguePicks = {};
        for (let i in leagueEntries){
            let entry = leagueEntries[i];
            let teamId = entry.entry_id.toString();
            let gameweekTeamDataResponse = await fplDraftService.getGameweekTeamData(gameweek, teamId);
            let gameweekTeamData = gameweekTeamDataResponse.data;
            let picks = gameweekTeamData.picks;
            leaguePicks[teamId] = picks;
            let gameweekPlayerHistoryResponse = await gameweekPlayerDataDao.putGameweekPlayerData(leagueDetails.league.id, teamId, gameweek, picks);
        }
        return leaguePicks;
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