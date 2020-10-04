var axios = require('axios');

/**
 * Service for fetching data from fantasy premier draft api
 */
module.exports = {

    getGameweekMetadata: async function() {
        let gameweekMetadataResponse = await axios.get('https://draft.premierleague.com/api/game');
        return gameweekMetadataResponse;
    },

    getBootstapStatic: async function() {
        let bootstrapStaticResponse = await axios.get('https://draft.premierleague.com/api/bootstrap-static');
        return bootstrapStaticResponse;
    },

    getGameweekFixtures: async function(gameweek) {
        let gameweekFixturesResponse = await axios.get('https://draft.premierleague.com/api/event/' + gameweek.toString() + '/fixtures');
        return gameweekFixturesResponse;
    },

    getLeagueDetails: async function(leagueId) {
        let leagueDetailsResponse = await axios.get('https://draft.premierleague.com/api/league/' + leagueId.toString() + '/details');
        return leagueDetailsResponse;
    },

    getGameweekTeamData: async function(gameweek, teamId) {
        let gameweekTeamDataResponse = await axios.get('https://draft.premierleague.com/api/entry/' + teamId.toString() + '/event/' + gameweek.toString());
        return gameweekTeamDataResponse;
    },

    getTopPlayers: async function() {
        let topPlayersResponse = await axios.get('https://draft.premierleague.com/api/top-elements');
        return topPlayersResponse;
    }
}