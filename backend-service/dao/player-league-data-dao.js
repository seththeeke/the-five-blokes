var mysql = require('mysql2/promise');

module.exports = {
    insertPlayer: async function(position_id, first_name, last_name, team_id, team_alternate_id){
        let connection = await mysql.createConnection({
            host     : process.env.AURORA_DB_ENDPOINT,
            user     : process.env.USERNAME,
            password : process.env.PASSWORD,
            database : process.env.DATABASE_NAME
        });
        try {
            let results = await connection.execute('INSERT INTO players (position_id, first_name, last_name, team_id) VALUES (?,?,?,?)', [position_id, first_name, last_name, team_id]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    }
}