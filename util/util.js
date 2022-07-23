require("dotenv").config();
const User = require("../server/models/user_model");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = process.env;
const { promisify } = require("util"); // util from native nodejs library

const multer = require("multer");
const upload = multer({
  limits: {
    fileSize: 500000000, // Maximum
  },
});

const cpUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "videoList", maxCount: 30 },
]);

const errorHandler = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
      req.user = user;
      if (roleId == null) {
        next();
      } else {
        let userDetail;
        if (roleId == User.USER_ROLE.ALL) {
          userDetail = await User.getUserDetail(user.email);
        } else {
          userDetail = await User.getUserDetail(user.email, roleId);
        }
        if (!userDetail) {
          res.status(403).send({ error: "Forbidden" });
        } else {
          req.user.id = userDetail.id;
          req.user.role_id = userDetail.role_id;
          next();
        }
      }
      return;
    } catch (err) {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
  };
};

const checkToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ msg: "No token. Please sign in or sign up first." });
    }
    // Get user's information from token
    const decoded = jwt.verify(token, TOKEN_SECRET);
    const payload = {
      data: {
        provider: decoded.provider,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        roleId: decoded.roleId,
        userId: decoded.userId,
      },
    };
    // Store payload (user's information) into request
    req.userInfo = payload;
    next();
  } catch (err) {
    if (err.message === "invalid token") {
      return res
        .status(401)
        .send({ msg: "Wrong token. Please sign in or sign up first." });
    }
    if (err.message === "jwt expired") {
      return res
        .status(401)
        .send({ msg: "Token expired. Please sign in again." });
    }
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  cpUpload,
  errorHandler,
  authentication,
  checkToken,
};
