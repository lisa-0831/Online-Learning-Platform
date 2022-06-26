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
      access_expired: TOKEN_EXPIRATION,
      login_at: new Date(),
    };

    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    user.access_token = accessToken;

    const [result] = await conn.query("INSERT INTO user SET ?", user);
    user.id = result.insertId;
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

    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Update the User's Info
    user.access_token = accessToken;
    user.access_expired = TOKEN_EXPIRATION;
    user.login_at = new Date();

    await conn.query(
      "UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?",
      [user.access_token, user.access_expired, user.login_at, user.id]
    );
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

const getUserDetail = async (token) => {
  try {
    console.log(token);
    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);
    console.log(125, decoded);
    return { decoded };
  } catch (e) {
    return { error: "Error 403: Wrong token" };
  }
};

module.exports = {
  USER_ROLE,
  signUp,
  nativeSignIn,
  getUserDetail,
};
