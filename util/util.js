require("dotenv").config();
const { TOKEN_SECRET } = process.env;

const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/assets/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const cpUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

const errorHandler = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
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
    // Store playload (user's information) into request
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
  checkToken,
};
