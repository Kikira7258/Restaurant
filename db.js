const mysql = require('mysql2');

// connect to database
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "restaurant"
})


module.exports = conn
