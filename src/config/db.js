const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.MYSQLPUBLIC_URL) {
    pool = mysql.createPool(process.env.MYSQLPUBLIC_URL);
} else {
    pool = mysql.createPool({
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'parivar_mart',
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;
