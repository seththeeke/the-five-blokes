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

/**
 * All functions related to processing a particular gameweek, collecting data, normalizing, badging
 */
module.exports = {
    hasGameweekCompleted: async function(hasGameweekCompletedRequest){
        console.log("Beginning to check if a gameweek has completed");
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);

        let gameweekMetadataResponse = await fplDraftService.getGameweekMetadata();
        let gameweekData = gameweekMetadataResponse.data;
        if (gameweekData.current_event_finished && (!lastCompletedGameweek || parseInt(gameweekData.current_event) > parseInt(lastCompletedGameweek.gameweek.N))) {
            console.log("New gameweek completed " + gameweekData);
            if (gameweekData.current_event === 38) {
                console.log("Season ended for league " + JSON.stringify(activeLeague));
                var seasonCompletedMessage = {
                    Message: activeLeague.leagueId.S,
                    Subject: activeLeague.leagueId.S,
                    TopicArn: hasGameweekCompletedRequest.seasonCompletedTopicArn
                };
                let seasonCompletedResponse = await sns.publish(seasonCompletedMessage).promise();
            }
            var gameweekCompletedMessage = {
                Message: gameweekData.current_event.toString(),
                Subject: activeLeague.leagueId.S,
                TopicArn: hasGameweekCompletedRequest.gameweekCompletedTopicArn
            };
            let gameweekCompletedResponse = await sns.publish(gameweekCompletedMessage).promise();
            console.log("Finished publishing gameweek completed information for league " + JSON.stringify(activeLeague));
        } else {
            console.log("No new gameweek information for league " + JSON.stringify(activeLeague));
        }
    },

    processGameweekCompleted: async function(processGameweekCompletedRequest){
        console.log("Beginning to process gameweek: " + JSON.stringify(processGameweekCompletedRequest));
        // fetch static content, persist and return a transformed list of player data for processing further
        let playerMap = await this._fetchAndPersistStaticData(processGameweekCompletedRequest.leagueId, processGameweekCompletedRequest.gameweekNum);
        // fetch fixtures and build a map of player data based on the fixture results in the gameweek
        let gameweekData = await this._fetchGameweekData(processGameweekCompletedRequest.gameweekNum);
        let gameweekFixtures = gameweekData.gameweekFixtures;
        let gameweekPlayerData = gameweekData.gameweekPlayerData;
        // fetch league details and persist the league state for the gameweek
        let leagueGameweekData = await this._fetchLeagueDetailsAndPersistGameweek(processGameweekCompletedRequest.leagueId, processGameweekCompletedRequest.gameweekNum, gameweekFixtures, gameweekPlayerData);
        let leagueDetails = leagueGameweekData.leagueDetails;
        let standings = leagueGameweekData.standings;
        // fetch teams for each participant for the gameweek and persist in history table
        let leaguePicks = await this._fetchAndPersistPlayerPicksForGameweek(leagueDetails, processGameweekCompletedRequest.gameweekNum);

        // Award Gameweek Badges
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
            let fiftyPlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, processGameweekCompletedRequest.gameweekNum, "50+ Point Gameweek", 50, "gte");
            // 75+ Point Gameweek
            let seventyFivePlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, processGameweekCompletedRequest.gameweekNum, "75+ Point Gameweek", 75, "gte");
            // 100+ Point Gameweek
            let oneHundredPlusGameweek = await this._badgePointBasedGameweekBadge(standing, leagueDetails, processGameweekCompletedRequest.gameweekNum, "100+ Point Gameweek", 100, "gte");
        }
        console.log("Gameweek winners: " + weeklyWinners + " with points: " + mostPoints);
        console.log("Gameweek losers: " + weeklyLosers + " with points: " + leastPoints);

        // Weekly Winners
        for (let i in weeklyWinners) {
            let entryId = weeklyWinners[i];
            let weeklyWinnerResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + entryId.toString() + "-Gameweek Winner" + "-" + processGameweekCompletedRequest.gameweekNum,
                entryId.toString(),
                "Gameweek Winner", 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": processGameweekCompletedRequest.gameweekNum,
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - Gameweek " + processGameweekCompletedRequest.gameweekNum + ": " + mostPoints,
                    "points": mostPoints
                },
                leagueDetails);
        }

        // Weekly Losers
        for (let i in weeklyLosers) {
            let entryId = weeklyLosers[i];
            let weeklyLoserResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + entryId.toString() + "-Gameweek Loser" + "-" + processGameweekCompletedRequest.gameweekNum,
                entryId.toString(),
                "Gameweek Loser", 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": processGameweekCompletedRequest.gameweekNum,
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - Gameweek " + processGameweekCompletedRequest.gameweekNum + ": " + leastPoints,
                    "points": leastPoints
                },
                leagueDetails);
        }

        // League Leader
        let leagueLeaderResponse = await badgesDao.addNewBadge(
            leagueDetails.league.id.toString() + "-" + gameweekFirstPlace.toString() + "-League Leader" + "-" + processGameweekCompletedRequest.gameweekNum,
            gameweekFirstPlace.toString(),
            "League Leader", 
            {
                "year": leagueDetails.league.draft_dt.substring(0, 4),
                "gameweek": processGameweekCompletedRequest.gameweekNum
            },
            leagueDetails);

        // Gameweek Last Place
        if (gameweekLastPlace) {
            let leagueLoserResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + gameweekLastPlace.toString() + "-League Loser" + "-" + processGameweekCompletedRequest.gameweekNum,
                gameweekLastPlace.toString(),
                "League Loser", 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": processGameweekCompletedRequest.gameweekNum
                },
                leagueDetails);
        }

        // Weekly MVP
        let topElementsResponse = await fplDraftService.getTopPlayers();
        let topPlayer = topElementsResponse.data[processGameweekCompletedRequest.gameweekNum.toString()];
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
                leagueDetails.league.id.toString() + "-" + leagueEntry[0].id.toString() + "-Gameweek MVP" + "-" + processGameweekCompletedRequest.gameweekNum,
                leagueEntry[0].id.toString(),
                "Gameweek MVP", 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "gameweek": processGameweekCompletedRequest.gameweekNum,
                    "player": playerMap[topPlayer.element.toString()]
                },
                leagueDetails);
        } else {
            console.log("No participant owned the top player for gameweek: " + processGameweekCompletedRequest.gameweekNum);
        }

        // award badges based on the player statistics for points, goals, assists, and aggregations
        let gameweekPlayerBadges = await this._badgeGameweekPlayers(leagueDetails, processGameweekCompletedRequest.gameweekNum, leaguePicks, playerMap, gameweekPlayerData);
    },

    _badgeGameweekPlayers: async function(leagueDetails, gameweek, leaguePicks, playerMap, gameweekPlayerData) {
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            let totalGoals = 0;
            let totalAssists = 0;
            for (let i in picks){
                let player = playerMap[picks[i].element.toString()];
                if (player){
                    // Negative Gameweek Player
                    let negativeGameweekPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, "Negative Gameweek Player", 0, "lt", gameweek, "starter");
                    // 15+ Point Gameweek Player
                    let fifteenPointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, "15+ Point Gameweek Player", 15, "gte", gameweek, "starter");
                    // 20+ Point Gameweek Player
                    let twentyPointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, "20+ Point Gameweek Player", 20, "gte", gameweek, "starter");
                    // 25+ Point Gameweek Player
                    let twentyFivePointPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, "25+ Point Gameweek Player", 25, "gte", gameweek, "starter");
                    // 10+ Point Bench Player
                    let tenPointBenchPlayer = await this._badgePlayerPointBasedGameweekBadge(player, picks[i], teamId, leagueDetails, "10+ Point Bench Player", 10, "gte", gameweek, "bench");
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
            let fifteenGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 15, leagueDetails, teamId, gameweek, "15+ Goal Gameweek");
            let tenGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 10, leagueDetails, teamId, gameweek, "10+ Goal Gameweek");
            let fiveGoalBadge = await this._badgeBasedOnValue(totalGoals, "gte", 5, leagueDetails, teamId, gameweek, "5+ Goal Gameweek");
            let zeroGoalBadge = await this._badgeBasedOnValue(totalGoals, "eq", 0, leagueDetails, teamId, gameweek, "0 Goal Gameweek");
            let fifteenAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 15, leagueDetails, teamId, gameweek, "15+ Assist Gameweek");
            let tenAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 10, leagueDetails, teamId, gameweek, "10+ Assist Gameweek");
            let fiveAssistBadge = await this._badgeBasedOnValue(totalAssists, "gte", 5, leagueDetails, teamId, gameweek, "5+ Assist Gameweek");
            let zeroAssistBadge = await this._badgeBasedOnValue(totalAssists, "eq", 0, leagueDetails, teamId, gameweek, "0 Assist Gameweek");
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
        let playerMap = {};
        for (let k in filteredPlayers){
            let player = filteredPlayers[k];
            playerMap[player.id.toString()] = player;
        }
        return playerMap;
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