const mysql = require('mysql2');
require('dotenv').config();

//creating database connection
const con = mysql.createPool({
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTIONLIMIT,
}).promise();

//listing for new connections
con.on('connection', function (connection) {
    console.log('DB Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'MySQL error', err.code);
    });
});

module.exports = con;
