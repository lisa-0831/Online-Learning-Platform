require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const createComment = async (comment, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const commentWithId = {
      commented_id: comment.commentedId,
      commented_type_id: comment.commentTypeId,
      user_id: decoded.userId,
      content: comment.content,
      create_time: Date.now(),
    };

    // const [[getUserStatus]] = await conn.query(
    //   "SELECT user.id, user.email, course_student.course_id \
    //   FROM user \
    //   LEFT JOIN course_student \
    //   ON user.id=course_student.user_id \
    //   WHERE email= ? && course_id=?",
    //   [decoded.email, comment.commentedId]
    // );

    // let commentedTypeSql = "";
    // if (!getUserStatus) {
    //   commentedTypeSql = "course_before_pay";
    // } else {
    //   commentedTypeSql = "course_after_pay";
    // }

    // const [[commentedTypeId]] = await conn.query(
    //   "SELECT id FROM commented_type WHERE type = ?",
    //   [commentedTypeSql]
    // );
    // commentWithId.commented_type_id = commentedTypeId.id;

    const [result] = await conn.query(
      "INSERT INTO comment SET ?",
      commentWithId
    );

    if (comment.commentTypeId == 1) {
      const ratingWithId = {
        comment_id: result.insertId,
        course_id: comment.commentedId,
        user_id: decoded.userId,
        star: comment.star,
        create_time: Date.now(),
      };

      const [ratingResult] = await conn.query(
        "INSERT INTO course_rating SET ?",
        ratingWithId
      );
    }

    await conn.query("COMMIT");
    return result.insertId;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  createComment,
};
