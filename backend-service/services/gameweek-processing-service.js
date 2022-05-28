var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var staticContentDao = require('./../dao/static-content-dao');
var gameweekPlayerDataDao = require('./../dao/gameweek-player-history-dao');
var fplDraftService = require('./fpl-draft-service');
var transactionsDao = require('./../dao/transactions-dao');

module.exports = {
    hasGameweekCompleted: async function(forceGameweekReprocessing, shouldOverrideSeasonCompletedChoice){
        console.log("Beginning to check if a gameweek has completed");
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);

        let gameweekMetadataResponse = await fplDraftService.getGameweekMetadata();
        let gameweekData = gameweekMetadataResponse.data;
        let response = {
            "gameweek": gameweekData.current_event.toString(),
            "league": activeLeague.leagueId.S,
            "hasCompleted": false,
            "shouldOverrideSeasonCompletedChoice": shouldOverrideSeasonCompletedChoice || false
        }
        if (forceGameweekReprocessing) {
            console.log("Gameweek completed check bypassed, reprocessing gameweek " + gameweekData);
            response.hasCompleted = true;
            return response;
        }
        if (gameweekData.current_event_finished && (!lastCompletedGameweek || parseInt(gameweekData.current_event) > parseInt(lastCompletedGameweek.gameweek.N))) {
            console.log("New gameweek completed " + JSON.stringify(gameweekData));
            response.hasCompleted = true;
            return response;
        }
        console.log("No new gameweek information for league " + JSON.stringify(activeLeague));
        return response;
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
            "gameweek": extractGameweekDataRequest.gameweekNum,
            "shouldOverrideSeasonCompletedChoice": extractGameweekDataRequest.shouldOverrideSeasonCompletedChoice || false
        };
    },

    extractTransactions: async function(extractGameweekDataRequest) {
        console.log("Starting to extract transaction date for league: " + extractGameweekDataRequest.league);
        let leagueId = extractGameweekDataRequest.league;
        let transactionsResponse = await fplDraftService.getTransactionsForLeagueId(leagueId);
        let transactions =  transactionsResponse.data.transactions;
        for (let i in transactions){
            let transaction = transactions[i];
            let insertTransactionResponse = await transactionsDao.addNewTransaction(
                transaction.id + "-" + transaction.entry + "-" + leagueId,
                transaction.id,
                transaction.element_in,
                transaction.element_out,
                transaction.entry,
                transaction.result,
                leagueId,
                transaction.added
            );
            console.log("Added new transaction for transaction id: " + transaction.id + " for league: " + leagueId);
        }
    },

    _getLeagueYear: function(leagueDetails){
        return leagueDetails.year.S + "/" + (parseInt(leagueDetails.year.S) + 1).toString();
    },

    _fetchAndPersistStaticData: async function(leagueId, gameweek){
        console.log("Fetching and persisting static content for leagueId: " + leagueId + " and gameweek: " + gameweek);
        let allSeasonDetailsResponse = await fplDraftService.getBootstapStatic();
        let allSeasonDetailsData = allSeasonDetailsResponse.data;
        let players = allSeasonDetailsData.elements;
        // filter out the players who haven't played, they are not relevant at this time.
        let filteredPlayers = players.filter(player => player.minutes > 0);
        let s3Response = await staticContentDao.putStaticContent(filteredPlayers, leagueId.toString() + "/" + gameweek.toString());
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
    }
}