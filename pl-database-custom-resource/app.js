var mysql = require('mysql2/promise');

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    return "Success";
}