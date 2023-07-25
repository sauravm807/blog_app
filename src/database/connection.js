const mysql = require('mysql2');
require('dotenv').config();

module.exports = {
    mysql: mysql.createPool({
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASSWORD || '',
        database: process.env.DATABASE || 'blog_db',
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    }).promise()
}
