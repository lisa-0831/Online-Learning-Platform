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
      picture: null,
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
  } catch (err) {
    return { error: "Error 403: Wrong token" };
  }
};

const getUserDetail = async (userId, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const [bought] = await conn.query(
      "SELECT course.id, course.cover, course.title, course.price \
    FROM course_student \
    LEFT JOIN course \
    ON course.id=course_student.course_id \
    WHERE course_student.user_id=?",
      [decoded.userId]
    );

    const [favorites] = await conn.query(
      "SELECT course.id, course.cover, course.title, course.price \
    FROM course_favorites \
    LEFT JOIN course \
    ON course.id=course_favorites.course_id \
    WHERE course_favorites.user_id=?",
      [decoded.userId]
    );

    const [teach] = await conn.query(
      "SELECT course.id, course.cover, course.title, course.price \
    FROM course \
    WHERE course.user_id=?",
      [decoded.userId]
    );

    user = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      bought: bought,
      favorites: favorites,
      teach: teach,
    };

    if (decoded.userId == userId) {
      user.auth = 1;
    } else {
      user.auth = 0;
    }

    return { user };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return { error };
  } finally {
    conn.release();
  }
};

module.exports = {
  USER_ROLE,
  signUp,
  nativeSignIn,
  getUserStatus,
  getUserDetail,
};
