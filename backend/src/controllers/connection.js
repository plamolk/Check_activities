const env = require('dotenv').config()
const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.ROOT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT_DATABASE,
})

module.exports = db;
