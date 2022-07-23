require("dotenv").config();
const { NODE_ENV } = process.env;
const bcrypt = require("bcrypt");
const { users } = require("./fake_data");
const { pool } = require("../server/models/mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser(conn) {
  const encryped_users = users.map((user) => {
    const encryped_user = {
      role_id: user.role_id,
      provider: user.provider,
      email: user.email,
      password: user.password ? bcrypt.hashSync(user.password, salt) : null,
      name: user.name,
      picture: user.picture,
      self_intro: user.self_intro,
      login_at: user.login_at,
    };
    return encryped_user;
  });
  return await conn.query(
    "INSERT INTO user (role_id, provider, email, password, name, picture, self_intro, login_at) VALUES ?",
    [encryped_users.map((x) => Object.values(x))]
  );
}

async function createFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await _createFakeUser(conn);
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
}

async function truncateFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }

  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
    return;
  };

  const tables = ["user"];
  for (let table of tables) {
    await truncateTable(table);
  }

  return;
}

async function closeConnection() {
  return await pool.end();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
