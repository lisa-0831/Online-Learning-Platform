require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_EXPIRATION, TOKEN_SECRET } = process.env;
const bcrypt = require("bcrypt");
const salt = parseInt(process.env.BCRYPT_SALT);
const jwt = require("jsonwebtoken");

const USER_ROLE = {
  ALL: -1,
  ADMIN: 1,
  USER: 2,
  TEACHER: 3,
};

const checkEmailExist = async (email, provider) => {
  sql = "SELECT id FROM user WHERE email = ? && provider = ?";
  const [emailExist] = await pool.query(sql, [email, provider]);
  return emailExist;
};

const signUp = async (name, roleId, email, password) => {
  const conn = await pool.getConnection();
  try {
    const [emailExist] = await checkEmailExist(email, "native");

    if (emailExist !== undefined) {
      return {
        error: "Email Already Exists",
        status: 403,
      };
    }

    const user = {
      role_id: roleId,
      provider: "native",
      email: email,
      password: bcrypt.hashSync(password, salt),
      name: name,
      picture: "profile.png",
      login_at: new Date(),
    };

    const [result] = await conn.query("INSERT INTO user SET ?", user);
    user.id = result.insertId;

    const access_token = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
        roleId: roleId,
        userId: result.insertId,
      },
      TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    user.access_token = access_token;

    return { user };
  } catch (error) {
    return {
      error: error,
    };
  } finally {
    conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [users] = await conn.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    const user = users[0];
    if (!user) {
      await conn.query("COMMIT");
      return { error: "Please Sign Up first." };
    }

    if (!bcrypt.compareSync(password, user.password)) {
      await conn.query("COMMIT");
      return { error: "Entered a Wrong Password. Please Sign In again." };
    }

    const access_token = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
        roleId: user.role_id,
        userId: user.id,
      },
      TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    user.access_token = access_token;

    // Update the User's Info
    await conn.query("UPDATE user SET login_at = ? WHERE id = ?", [
      new Date(),
      user.id,
    ]);
    await conn.query("COMMIT");

    return { user };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return { error };
  } finally {
    conn.release();
  }
};

const getUserStatus = async (token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);
    return { decoded };
  } catch (error) {
    return { error: "Error 401: Wrong token" };
  }
};

const getUserProfile = async (userId, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // Verify token
    let decoded;
    if (token !== "null") {
      // The case that user has logged in
      decoded = jwt.verify(token, TOKEN_SECRET);
    }

    const userInfoSql = `SELECT user.name, user.email, user.picture, user.self_intro, role.name AS role 
                         FROM user 
                         LEFT JOIN role 
                         ON user.role_id=role.id 
                         WHERE user.id=?`;

    const boughtSql = `SELECT course.id, course.cover, course.title, course.price 
                       FROM course_student 
                       LEFT JOIN course 
                       ON course.id=course_student.course_id 
                       WHERE course_student.user_id=?`;

    const favoritesSql = `SELECT course.id, course.cover, course.title, course.price 
                          FROM course_favorites 
                          LEFT JOIN course 
                          ON course.id=course_favorites.course_id 
                          WHERE course_favorites.user_id=?`;

    const reserveSql = `SELECT livestream.id, livestream.cover, livestream.title, livestream.start_time 
                        FROM livestream_student 
                        LEFT JOIN livestream 
                        ON livestream.id=livestream_student.livestream_id 
                        WHERE livestream_student.user_id=?`;

    const teachSql = `SELECT course.id, course.cover, course.title, course.price 
                      FROM course 
                      WHERE course.user_id=?`;

    const streamerSql = `SELECT livestream.id, livestream.cover, livestream.title, livestream.start_time 
                         FROM livestream 
                         WHERE livestream.user_id=?`;

    const userProfileInfo = await Promise.all([
      conn.query(userInfoSql, [userId]),
      conn.query(boughtSql, [userId]),
      conn.query(favoritesSql, [userId]),
      conn.query(reserveSql, [userId]),
      conn.query(teachSql, [userId]),
      conn.query(streamerSql, [userId]),
    ]);

    const [userInfo] = userProfileInfo[0][0];
    const bought = userProfileInfo[1][0];
    const favorites = userProfileInfo[2][0];
    const reserve = userProfileInfo[3][0];
    const teach = userProfileInfo[4][0];
    const streamer = userProfileInfo[5][0];

    const user = {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      selfIntro: userInfo.self_intro,
      role: userInfo.role,
      bought: bought,
      favorites: favorites,
      reserve: reserve,
      teach: teach,
      streamer: streamer,
    };

    if (token !== "null" && decoded.userId == userId) {
      user.auth = 1;
    } else {
      user.auth = 0;
    }

    return { user };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log("Get User's Information: ", error);
    return -1;
  } finally {
    conn.release();
  }
};

const getUserDetail = async (email, roleId) => {
  try {
    if (roleId) {
      const [users] = await pool.query(
        "SELECT * FROM user WHERE email = ? AND role_id = ?",
        [email, roleId]
      );
      return users[0];
    } else {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [
        email,
      ]);
      return users[0];
    }
  } catch (e) {
    return null;
  }
};

module.exports = {
  USER_ROLE,
  signUp,
  nativeSignIn,
  getUserDetail,
  getUserStatus,
  getUserProfile,
};
