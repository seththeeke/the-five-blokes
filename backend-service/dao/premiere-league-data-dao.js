var mysql = require('mysql2/promise');
var { v4: uuidv4 } = require('uuid');
var foreignIdToTeamIdCache = {};
var foreignIdToFixtureCache = {};
var foreignIdToPlayerIdCache = {};

module.exports = {

    getTeamByTeamName: async function(name) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('SELECT DISTINCT * FROM teams WHERE name = ?', [name]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getTeamIdByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToTeamIdCache[foreign_id]) {
                let results = await connection.execute('SELECT team_id FROM team_season_data where foreign_id = ?;', [foreign_id]);
                foreignIdToTeamIdCache[foreign_id] = results;
            } 
            await connection.end();
            return foreignIdToTeamIdCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getPlayerIdByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToPlayerIdCache[foreign_id]) {
                let results = await connection.execute('SELECT player_id FROM player_season_data where foreign_id = ?;', [foreign_id]);
                foreignIdToPlayerIdCache[foreign_id] = results;
            } 
            await connection.end();
            return foreignIdToPlayerIdCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getFixtureByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToFixtureCache[foreign_id]) {
                let results = await connection.execute('SELECT fixture_id,gameweek FROM fixtures where foreign_id = ?;', [foreign_id]);
                foreignIdToFixtureCache[foreign_id] = results;
            } 
            await connection.end();
            return foreignIdToFixtureCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    insertTeam: async function(name, founded_year) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO teams (team_id, name, founded_year) VALUES (?,?,?)', [uuidv4(), name, founded_year]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    insertTeamSeasonData: async function(foreign_id, team_id, league_year, rank, wins, loses, ties, points) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO team_season_data (team_season_id, foreign_id, team_id, league_year, rank, wins, loses, ties, points) VALUES (?,?,?,?,?,?,?,?,?)', [uuidv4(), foreign_id, team_id, league_year, rank | 0, wins | 0, loses | 0, ties | 0, points | 0]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            if (err.message.indexOf("Duplicate entry") != -1){
                // TODO: handle this case better, maybe an upsert
                console.log("Team season data already exists");
            } else {
                throw err;
            }
        }
    },

    insertPlayer: async function(position_id, first_name, last_name, foreign_team_id){
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO players (player_id, position_id, first_name, last_name, foreign_team_id) VALUES (?,?,?,?,?)', [uuidv4(), position_id, first_name, last_name, foreign_team_id]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    insertPlayerSeasonData: async function(foreign_id, player_id, league_year){
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO player_season_data (player_season_id, foreign_id, player_id, league_year) VALUES (?,?,?,?)', [uuidv4(), foreign_id, player_id, league_year]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            if (err.message.indexOf("Duplicate entry") != -1){
                // TODO: handle this case better, maybe an upsert
                console.log("Player season data already exists");
            } else {
                throw err;
            }
        }
    },

    insertFixture: async function(foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek){
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO fixtures (fixture_id, foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek) VALUES (?,?,?,?,?,?,?,?,?)', [uuidv4(), foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            if (err.message.indexOf("Duplicate entry") != -1){
                // TODO: handle this case better, maybe an upsert
                console.log("fixture data already exists");
            } else {
                throw err;
            }
        }
    },

    upsertFixture: async function(foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek){
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO fixtures (fixture_id, foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE foreign_id= ?', [uuidv4(), foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek, foreign_id]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    insertPlayerFixture: async function(player_id, fixture_id, goals, assists, fixture_year, gameweek, clean_sheets, points, minutes_played, yellow_cards, red_cards) {
        // fixture.bonus,fixture.goals_conceded, fixture.own_goals, fixtures.penalties_missed,fixtures.penalties_saved, saves
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO player_fixtures (player_fixture_id, player_id, fixture_id, goals, assists, fixture_year, gameweek, clean_sheets, points, minutes_played, yellow_cards, red_cards) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [uuidv4(), player_id, fixture_id, goals, assists, fixture_year, gameweek, clean_sheets, points, minutes_played, yellow_cards, red_cards]);
            await connection.end();
            return results;
        } catch (err){
            if (err.message.indexOf("Duplicate entry") != -1){
                // TODO: handle this case better, maybe an upsert
                console.log("player fixture data already exists");
            } else {
                throw err;
            }
        }
    },

    getPlayerByNameAndPosition: async function(first_name, second_name, position_id) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('SELECT DISTINCT * FROM players WHERE first_name = ? AND last_name = ? AND position_id = ?', [first_name, second_name, position_id]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    createConnection: async function() {
        let connection = await mysql.createConnection({
            host     : process.env.AURORA_DB_ENDPOINT,
            user     : process.env.USERNAME,
            password : process.env.PASSWORD,
            database : process.env.DATABASE_NAME
        });
        return connection;
    }
}