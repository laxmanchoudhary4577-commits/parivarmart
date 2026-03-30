const mysql = require('mysql2/promise');
require('dotenv').config();

function parseConnectionString(urlStr) {
    const url = new URL(urlStr);
    return {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1)
    };
}

let pool;

console.log('Environment check:');
console.log('MYSQLPUBLIC_URL:', process.env.MYSQLPUBLIC_URL ? 'SET' : 'NOT SET');
console.log('MYSQLHOST:', process.env.MYSQLHOST);

if (process.env.MYSQLPUBLIC_URL && process.env.MYSQLPUBLIC_URL.includes('mysql://')) {
    const config = parseConnectionString(process.env.MYSQLPUBLIC_URL);
    console.log('Using MYSQLPUBLIC_URL with config:', { ...config, password: '***' });
    pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} else {
    console.log('Using individual env vars');
    pool = mysql.createPool({
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'parivar_mart',
        port: parseInt(process.env.MYSQLPORT) || parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;
