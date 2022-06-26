require("dotenv").config();
const mysql = require("mysql2/promise"); // get the client
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

// Create the connection pool.
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  pool,
};
