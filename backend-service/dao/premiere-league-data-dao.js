var mysql = require('mysql2/promise');

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

    insertTeam: async function(name, founded_year) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO teams (name, founded_year) VALUES (?,?)', [name, founded_year]);
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
            let results = await connection.execute('INSERT INTO team_season_data (foreign_id, team_id, league_year, rank, wins, loses, ties, points) VALUES (?,?,?,?,?,?,?,?)', [foreign_id, team_id, league_year, rank | 0, wins | 0, loses | 0, ties | 0, points | 0]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    insertPlayer: async function(position_id, first_name, last_name, team_id, team_alternate_id){
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('INSERT INTO players (position_id, first_name, last_name, team_id) VALUES (?,?,?,?)', [position_id, first_name, last_name, team_id]);
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