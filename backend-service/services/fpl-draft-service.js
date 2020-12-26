var axios = require('axios');
var BASE_PATH = "https://draft.premierleague.com/api";

/**
 * Service for fetching data from fantasy premier draft api
 */
module.exports = {
    getGameweekMetadata: async function() {
        let gameweekMetadataResponse = await axios.get(BASE_PATH + '/game');
        return gameweekMetadataResponse;
    },

    getBootstapStatic: async function() {
        let bootstrapStaticResponse = await axios.get(BASE_PATH + '/bootstrap-static');
        return bootstrapStaticResponse;
    },

    getGameweekFixtures: async function(gameweek) {
        let gameweekFixturesResponse = await axios.get(BASE_PATH + '/event/' + gameweek.toString() + '/fixtures');
        return gameweekFixturesResponse;
    },

    getLeagueDetails: async function(leagueId) {
        let leagueDetailsResponse = await axios.get(BASE_PATH + '/league/' + leagueId.toString() + '/details');
        return leagueDetailsResponse;
    },

    getGameweekTeamData: async function(gameweek, teamId) {
        let gameweekTeamDataResponse = await axios.get(BASE_PATH + '/entry/' + teamId.toString() + '/event/' + gameweek.toString());
        return gameweekTeamDataResponse;
    },

    getTopPlayers: async function() {
        let topPlayersResponse = await axios.get(BASE_PATH + '/top-elements');
        return topPlayersResponse;
    },

    getElementSummary: async function(elementId) {
        let elementSummaryResponse = await axios.get(BASE_PATH + '/element-summary/' + elementId.toString());
        return elementSummaryResponse;
    }
}