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

        // iterate through players, insert the basic player data into the players table and into the player_season_data table to use as a mapping
        let players = bootstrapStatic.data.elements;
        for (let i in players){
            let player = players[i];
            let playerObject = await this._persistPlayerIfNotExists(player);
            // for each player, insert a player_season row for the season
            let playerSeasonInsertResults = await premiereLeagueDataDao.insertPlayerSeasonData(player.id, playerObject.player_id, this._getLeagueYear(activeLeague));
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