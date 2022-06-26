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
  console.log(data);

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

module.exports = {
  signUp,
  signIn,
};