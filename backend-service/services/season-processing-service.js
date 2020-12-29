var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var fplDraftService = require('./fpl-draft-service');
var premiereLeagueDataDao = require('./../dao/premiere-league-data-dao');

module.exports = {
    extractSeasonData: async function(extractSeasonDataRequest){
        // fetch bootstrap static
        let bootstrapStatic = await fplDraftService.getBootstapStatic();
        // fetch the league details
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let teams = bootstrapStatic.data.teams;

        // iterate through teams, insert teams into teams table
        for (let i in teams){
            let team = teams[i];
            // Team Data should likely be gathered at league initiation rather than season completion
            let teamObject = await this._persistTeamIfNotExists(team);
            // for each team, insert team_season data into team_season_data table for the season
            let teamSeasonInsertResults = await premiereLeagueDataDao.insertTeamSeasonData(team.id, teamObject.team_id, this._getLeagueYear(activeLeague));
        }

        // Fetch and Populate the Fixtures Table with all gameweek fixtures, these exist in ddb now
        let allGameweeks = await gameweeksDao.getAllGameweeksForLeague(activeLeague);
        for (let i in allGameweeks) {
            let gameweek = allGameweeks[i];
            let fixtures = JSON.parse(gameweek.fixtures);
            for (let j in fixtures) {
                let fixture = fixtures[j];
                let homeTeamIdResults = await premiereLeagueDataDao.getTeamIdByForeignId(fixture.team_h);
                let awayTeamIdResults = await premiereLeagueDataDao.getTeamIdByForeignId(fixture.team_a);
                let fixturesInsertResults = await premiereLeagueDataDao.insertFixture(fixture.id, awayTeamIdResults[0][0].team_id, homeTeamIdResults[0][0].team_id, fixture.kickoff_time, this._getLeagueYear(activeLeague), fixture.team_h_score, fixture.team_a_score, parseInt(gameweek.gameweek));
            }
        }

        // iterate through players, insert the basic player data into the players table and into the player_season_data table to use as a mapping
        let players = bootstrapStatic.data.elements;
        for (let i in players){
            let player = players[i];
            // Player Data should likely be gathered at league initiation rather than season completion
            let playerObject = await this._persistPlayerIfNotExists(player);
            let elementSummary = await fplDraftService.getElementSummary(player.id);
            let fixtureHistory = elementSummary.data.history;
            for (let i in fixtureHistory){
                let fixture = fixtureHistory[i];
                // fixture ids are different than player history fixture ids, fixture.fixture appears to be the link
                let fixtureResults = await premiereLeagueDataDao.getFixtureByForeignId(fixture.fixture);
                let fixtureId = (fixtureResults[0].length > 0) ? fixtureResults[0][0].fixture_id : undefined;
                let gameweek = (fixtureResults[0].length > 0) ? fixtureResults[0][0].gameweek: undefined;
                if (fixtureId) {
                    console.log("Adding fixture for playerId: " + playerObject.player_id + " and fixtureId: " + fixtureId);
                    let playerFixtureResult = await premiereLeagueDataDao.insertPlayerFixture(playerObject.player_id, fixtureId, fixture.goals_scored, fixture.assists, this._getLeagueYear(activeLeague), gameweek, fixture.clean_sheets, fixture.total_points, fixture.minutes, fixture.yellow_cards, fixture.red_cards);
                } else {
                    console.log("FixtureId does not exist in database for foreign_id: " + fixture.fixture + ". This is likely because of test data and shouldn't happen in production");
                }
            }

            // Need to add this data to the player fixture table
            // "bonus": 3,
            // "goals_conceded": 3,
            // "own_goals": 0,
            // "penalties_missed": 0,
            // "penalties_saved": 0,
            // "saves": 0,
        }
        
        // All transactions
        // https://draft.premierleague.com/api/draft/league/11133/transactions
        // fetch all transactions for the league
        // iterate through the transactions and insert them into the transactions table

        // Top Elements
        // https://draft.premierleague.com/api/top-elements
        return extractSeasonDataRequest;
    },

    _persistTeamIfNotExists: async function(team) {
        let teamObjectResults = await premiereLeagueDataDao.getTeamByTeamName(team.name);
        if (teamObjectResults[0].length <= 0){
            let teamInsertResults = await premiereLeagueDataDao.insertTeam(team.name, "-1");
            teamObjectResults = await premiereLeagueDataDao.getTeamByTeamName(team.name);
        }
        return teamObjectResults[0][0];
    },

    _persistPlayerIfNotExists: async function(player, team_id) {
        let playerObjectResults = await premiereLeagueDataDao.getPlayerByNameAndPosition(player.first_name, player.second_name, player.element_type);
        if (playerObjectResults[0].length <= 0){
            let playerInsertResults = await premiereLeagueDataDao.insertPlayer(player.element_type, player.first_name, player.second_name, player.team); 
            playerObjectResults = await premiereLeagueDataDao.getPlayerByNameAndPosition(player.first_name, player.second_name, player.element_type);
        }
        return playerObjectResults[0][0];
    },

    _getLeagueYear: function(leagueDetails){
        return leagueDetails.year.S + "/" + (parseInt(leagueDetails.year.S) + 1).toString();
    }
}