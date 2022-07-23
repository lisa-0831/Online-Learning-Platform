require("dotenv").config();
const mysql = require("mysql2/promise"); // get the client
const env = process.env.NODE_ENV || "development";
const multipleStatements = process.env.NODE_ENV === "test";
const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_HOST_TEST,
  DB_USERNAME_TEST,
  DB_PASSWORD_TEST,
  DB_DATABASE_TEST,
} = process.env;

const mysqlConfig = {
  development: {
    // for EC2 machine
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    host: DB_HOST_TEST,
    user: DB_USERNAME_TEST,
    password: DB_PASSWORD_TEST,
    database: DB_DATABASE_TEST,
  },
};

let mysqlEnv = mysqlConfig[env];
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;
mysqlEnv.queueLimit = 0;

const pool = mysql.createPool(mysqlEnv, { multipleStatements });

module.exports = {
  mysql,
  pool,
};
