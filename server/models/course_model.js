require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const createCourse = async (course, hashtags) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query("INSERT INTO course SET ?", course);

    // Hashtags
    let insertSqlMark = "";
    let selectSqlMark = "";
    for (let i = 0; i < hashtags.length; i++) {
      insertSqlMark += "(?), ";
      selectSqlMark += "?, ";
    }
    insertSqlMark = insertSqlMark.slice(0, -2);
    selectSqlMark = selectSqlMark.slice(0, -2);

    // Insert Tags Into Tags Table
    const [insertTagResult] = await conn.query(
      "INSERT IGNORE INTO tag (name) VALUES " + insertSqlMark,
      hashtags
    );

    // Select Tags From Tags Table
    const condition = { sql: "", binding: [] };
    condition.sql =
      "SELECT id FROM tag WHERE name in (" +
      selectSqlMark +
      ") ORDER BY field(name, " +
      selectSqlMark +
      ")";
    condition.binding = hashtags.concat(hashtags);
    const [tagId] = await conn.query(condition.sql, condition.binding);

    // Insert Data Into Course_tags Table
    const courseToTagCondition = {
      sql: "INSERT INTO course_tag (course_id, tag_id) VALUES ",
      binding: [],
    };
    for (let i = 0; i < tagId.length; i++) {
      courseToTagCondition.sql += `(${result.insertId}, ?), `;
      courseToTagCondition.binding.push(tagId[i].id);
    }
    courseToTagCondition.sql = courseToTagCondition.sql.slice(0, -2);
    const [courseToTag] = await conn.query(
      courseToTagCondition.sql,
      courseToTagCondition.binding
    );
    console.log(45, courseToTag);

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

const getCourses = async (
  hashtagSize,
  pageSize,
  paging = 0,
  requirement = {}
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const condition = {
      sql: [
        "SELECT course.id, course.cover, course.title, course.price, \
      course.upload_time, COUNT(course_student.user_id) AS students_num \
      FROM course \
      LEFT JOIN course_student \
      ON course.id=course_student.course_id ",
      ],
      binding: [],
    };

    // Category
    if (requirement.category !== "all") {
      condition.sql.push(
        "LEFT JOIN category \
    ON course.category_id=category.id \
    WHERE category.name= ? "
      );
      condition.binding = [requirement.category];
    } else if (requirement.hashtag !== undefined) {
      condition.sql.push(
        "LEFT JOIN course_tag \
      ON course_student.course_id=course_tag.course_id \
      LEFT JOIN tag \
      ON course_tag.tag_id=tag.id \
      WHERE tag.name=? "
      );
      condition.binding = [`#${requirement.hashtag}`];
    }

    // Order
    if (requirement.order == "trending") {
      condition.sql.push("GROUP BY course.id ORDER by students_num DESC ");
    } else if (requirement.order == "latest") {
      condition.sql.push("GROUP BY course.id ORDER by upload_time DESC ");
    }

    const limit = {
      sql: "LIMIT ?, ? ",
      binding: [pageSize * paging, pageSize],
    };

    const courseQuery = condition.sql.join("") + limit.sql;
    const courseBindings = condition.binding.concat(limit.binding);
    const [products] = await conn.query(courseQuery, courseBindings);

    const hashtagQuery = "SELECT * FROM pi.tag ORDER BY views DESC LIMIT 0, ?";
    const [hashtags] = await conn.query(hashtagQuery, hashtagSize);

    const hashtagUpdate = "UPDATE pi.tag SET views = views + 1 WHERE name=?";
    await conn.query(hashtagUpdate, `#${requirement.hashtag}`);

    await conn.query("COMMIT");
    return { products: products, hashtags: hashtags };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const getCourse = async (courseId, token) => {
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

    let sql =
      "SELECT course.title, course.description, course.upload_time, \
            course.video, user.name FROM course INNER JOIN user \
     ON course.user_id=user.id \
     WHERE course.id = ?";
    const [[details]] = await conn.query(sql, courseId);

    if (status == "course_before_pay") {
      details.video = "lock.mp4";
    }

    // Comments
    const [[commented_type_id]] = await conn.query(
      "SELECT id FROM commented_type WHERE type= ? ",
      [status]
    );

    const [comments] = await conn.query(
      "SELECT comment.content, comment.create_time, user.name, user.picture, user.id \
     FROM comment \
     LEFT JOIN user \
     ON comment.user_id=user.id \
     WHERE comment.commented_id= ? and comment.commented_type_id= ? \
     ORDER BY comment.create_time DESC",
      [courseId, commented_type_id.id]
    );

    await conn.query("COMMIT");
    return { details: details, comments: comments };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
};
