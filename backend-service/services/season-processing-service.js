var fplDraftService = require('./fpl-draft-service');
var premiereLeagueDataDao = require('./../dao/premiere-league-data-dao');

module.exports = {
    extractSeasonData: async function(extractSeasonDataRequest){
        // fetch bootstrap static
        // iterate through teams, insert teams into teams table
        // for each team, insert team_season data into team_season_data table for the season
        // iterate through players, insert the basic player data into the players table and into the player_season_data table to use as a mapping
        // after inserting a player, get their element summary and get their fixture history and insert into player_fixtures tables
        // fetch the league details and all the transactions for the league
        // iterate through the transactions and insert them into the transactions table

        let bootstrapStatic = await fplDraftService.getBootstapStatic();
        let players = bootstrapStatic.data.elements;
        let teams = bootstrapStatic.data.teams;
        console.log(teams);
        for (let i in teams){
            let team = teams[i];
            // Team Data should likely be gathered at league initiation
            let teamObject = await this.upsertTeam(team);
            console.log(JSON.stringify(teamObject));
            // fetch league details to get league year
            let teamSeasonInsertResults = await premiereLeagueDataDao.insertTeamSeasonData(team.id, teamObject.team_id, "2020/2021");
        }
        
        // League Details
        // https://draft.premierleague.com/api/league/11133/details
        // Top Elements
        // https://draft.premierleague.com/api/top-elements
        // All transactions
        // https://draft.premierleague.com/api/draft/league/11133/transactions
        // Fixture and Player history for season given player id
        // https://draft.premierleague.com/api/element-summary/254
        // try {
        //     let results = await premiereLeagueDataDao.insertPlayer(1, "Seth", "Theeke", 1, 1);
        //     console.log(JSON.stringify(results));
        // } catch (err){
        //     return err;
        // }
        return extractSeasonDataRequest;
    },

    upsertTeam: async function(team) {
        let teamObjectResults = await premiereLeagueDataDao.getTeamByTeamName(team.name);
        if (teamObjectResults[0].length <= 0){
            let teamInsertResults = await premiereLeagueDataDao.insertTeam(team.name, "-1");
            teamObjectResults = await premiereLeagueDataDao.getTeamByTeamName(team.name);
        }
        return teamObjectResults[0][0];
    }
}