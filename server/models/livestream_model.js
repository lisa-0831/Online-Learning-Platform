require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

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

const getLivestream = async (courseId, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    let status = "course_after_pay";
    if (!token) {
      status = "course_before_pay";
    } else {
      try {
        // Verify token
        const decoded = jwt.verify(token, TOKEN_SECRET);

        const [[getUserStatus]] = await conn.query(
          "SELECT user.id, user.email, course_student.course_id \
            FROM user \
            LEFT JOIN course_student \
            ON user.id=course_student.user_id \
            WHERE email= ? && course_id=?",
          [decoded.email, courseId]
        );

        if (!getUserStatus) {
          status = "course_before_pay";
        }
      } catch (error) {
        status = "course_before_pay";
        console.log("Happened when showing the Course Page", error);
      }
    }

    let sql;
    if (status == "course_before_pay") {
      sql =
        "SELECT course.title, course.description, course.price, \
            course.upload_time, course.video, user.name, \
            JSON_ARRAYAGG(JSON_OBJECT('title', course_video.title)) AS videoList \
          FROM course \
          INNER JOIN user \
          ON course.user_id=user.id \
          LEFT JOIN course_video \
          ON course.id=course_video.course_id \
          WHERE course.id = ?";
    } else if (status == "course_after_pay") {
      sql =
        "SELECT course.title, course.description, course.price, \
            course.upload_time, course.video, user.name, \
            JSON_ARRAYAGG(JSON_OBJECT('title', course_video.title, 'video', course_video.video)) AS videoList \
          FROM course \
          INNER JOIN user \
          ON course.user_id=user.id \
          LEFT JOIN course_video \
          ON course.id=course_video.course_id \
          WHERE course.id = ?";
    }
    const [[details]] = await conn.query(sql, courseId);

    // Q&A
    const [[course_before_pay_type_id]] = await conn.query(
      "SELECT id FROM commented_type WHERE type= ? ",
      ["course_before_pay"]
    );

    const [questions] = await conn.query(
      "SELECT comment.content, comment.create_time, user.name, user.picture, user.id \
       FROM comment \
       LEFT JOIN user \
       ON comment.user_id=user.id \
       WHERE comment.commented_id= ? and comment.commented_type_id= ? \
       ORDER BY comment.create_time DESC",
      [courseId, course_before_pay_type_id.id]
    );

    await conn.query("COMMIT");
    return {
      details: details,
      questions: questions,
      status: status,
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
};
