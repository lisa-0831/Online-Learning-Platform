require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const addFavorites = async (body, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const [[checkHistory]] = await conn.query(
      "SELECT * FROM course_favorites WHERE user_id=? && course_id=?",
      [decoded.userId, body.id]
    );

    if (!checkHistory) {
      const favorites = {
        user_id: decoded.userId,
        course_id: body.id,
      };

      const [result] = await conn.query(
        "INSERT INTO course_favorites SET ?",
        favorites
      );

      await conn.query("COMMIT");
      return result.insertId;
    } else {
      await conn.query("COMMIT");
      return -1;
    }
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  addFavorites,
};
