require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const bookLivestream = async (body, token) => {
  const livestreamId = body.id;
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const [[checkHistory]] = await conn.query(
      "SELECT * FROM livestream_student WHERE user_id=? && livestream_id=?",
      [decoded.userId, livestreamId]
    );

    if (!checkHistory) {
      const booking = {
        user_id: decoded.userId,
        livestream_id: livestreamId,
      };

      const [result] = await conn.query(
        "INSERT INTO livestream_student SET ?",
        booking
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

const getLivestreams = async (pageSize, paging = 0, requirement = {}) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const condition = {
      sql: [
        "SELECT livestream.id, livestream.title, livestream.cover, \
        livestream.start_time, COUNT(livestream_student.user_id) AS students_num \
        FROM livestream \
        LEFT JOIN livestream_student \
        ON livestream.id=livestream_student.livestream_id ",
      ],
      binding: [],
    };
    const pagingCondition = {
      sql: ["SELECT COUNT(*) FROM pi.livestream "],
      binding: [],
    };

    // Category
    if (requirement.category !== "all") {
      let categorySql =
        "LEFT JOIN category \
        ON livestream.category_id=category.id \
        WHERE category.name= ? ";

      condition.sql.push(categorySql);
      condition.binding = [requirement.category];
      pagingCondition.sql.push(categorySql);
      pagingCondition.binding = [requirement.category];
    }

    // Order
    if (requirement.order == "trending") {
      condition.sql.push("GROUP BY livestream.id ORDER by students_num DESC ");
    } else if (requirement.order == "latest") {
      condition.sql.push("GROUP BY livestream.id ORDER by upload_time DESC ");
    }

    const limit = {
      sql: "LIMIT ?, ? ",
      binding: [pageSize * paging, pageSize],
    };

    const livestreamQuery = condition.sql.join("") + limit.sql;
    const livestreamBindings = condition.binding.concat(limit.binding);
    const [products] = await conn.query(livestreamQuery, livestreamBindings);

    const pagingQuery = pagingCondition.sql.join("");
    const [livestreamNum] = await conn.query(
      pagingQuery,
      pagingCondition.binding
    );

    await conn.query("COMMIT");
    return { products: products, livestreamNum: livestreamNum };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const getLivestream = async (livestreamId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    // Verify token
    let sql =
      "SELECT livestream.id, livestream.title, livestream.introduction, livestream.description, \
      livestream.preparation, livestream.cover, livestream.teaser, livestream.start_time, \
      COUNT(livestream_student.user_id) AS students_num, user.name AS teacher_name \
      FROM livestream \
      LEFT JOIN livestream_student \
      ON livestream.id=livestream_student.livestream_id \
      LEFT JOIN user \
      ON livestream.user_id=user.id \
      WHERE livestream.id=?";
    const [[details]] = await conn.query(sql, livestreamId);

    await conn.query("COMMIT");
    return {
      details: details,
    };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  //   createLivestream,
  getLivestreams,
  getLivestream,
  bookLivestream,
};
