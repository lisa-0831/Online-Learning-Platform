const User = require("../models/user_model");
const validator = require("validator");

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({
      error: "Request Error: User needs to enter name, email and password.",
    });
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Request Error: Invalid Email." });
  }

  name = validator.escape(name);
  const result = await User.signUp(name, User.USER_ROLE.USER, email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    return { error: "Request Error: User needs to enter email and password." };
  }

  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

const signIn = async (req, res) => {
  const data = req.body;
  console.log(61, data);

  switch (data.provider) {
    case "native":
      result = await nativeSignIn(data.email, data.password);
      break;
    case "facebook":
      result = await facebookSignIn(data.access_token);
      break;
    default:
      result = { error: "Wrong Request" };
  }

  if (result.error) {
    const statusCode = result.status ? result.status : 403;
    return res.status(statusCode).send({ error: result.error });
  }

  const user = result.user;
  if (!user) {
    return res.status(500).send({ error: "Database Error" });
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const getUserStatus = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Error 401: No token");
    }

    const token = req.headers.authorization.split(" ")[1];
    const { decoded } = await User.getUserStatus(token);
    if (decoded.error) {
      console.log(decoded.error);
      const statusCode = decoded.status ? decoded.status : 403;
      return res.status(statusCode).send({ error: decoded.error });
    }

    let userDetail = {
      data: {
        provider: decoded.provider,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        userId: decoded.userId,
      },
    };
    return res.status(200).send(userDetail);
  } catch (e) {
    res.status(500).send(e.message);
    return;
  }
};

const getUserInfo = async (req, res) => {
  const authorization = req.headers.authorization;
  let token = "";
  if (authorization !== undefined) {
    token = authorization.split(" ")[1];
  }

  // const details = req.params.category || "details";
  const userId = parseInt(req.query.id);
  if (Number.isInteger(userId)) {
    // return await User.getUserDetail(userId, token);
    const user = await User.getUserDetail(userId, token);
    return res.send({ user });
  }
};

module.exports = {
  signUp,
  signIn,
  getUserStatus,
  getUserInfo,
};
