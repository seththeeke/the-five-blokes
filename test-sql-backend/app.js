var mysql = require('mysql2/promise');

// https://www.npmjs.com/package/mysql
exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    let connection = await mysql.createConnection({
        host     : process.env.AURORA_DB_ENDPOINT,
        user     : process.env.USERNAME,
        password : process.env.PASSWORD,
        database : process.env.DATABASE_NAME
    });
    // connection.connect();
    try {
        let results = await connection.query('SELECT * from players');
        console.log(JSON.stringify(results));
        await connection.end();
    } catch (err){
        await connection.end();
        return err;
    }
}