require('dotenv').config()
const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_ROOT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,

})

module.exports = db;
