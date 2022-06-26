const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  signUp,
  signIn,
  getUserProfile,
} = require("../controllers/user_controller");

router.route("/user/signup").post(errorHandler(signUp));
router.route("/user/signin").post(errorHandler(signIn));
router.route("/user/profile").get(errorHandler(getUserProfile));

module.exports = router;
