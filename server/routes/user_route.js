const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  signUp,
  signIn,
  getUserStatus,
} = require("../controllers/user_controller");

router.route("/user/signup").post(errorHandler(signUp));
router.route("/user/signin").post(errorHandler(signIn));
router.route("/user/status").get(errorHandler(getUserStatus));
// router.route("/user/profile/:detail").get(errorHandler(getUserStatus));

module.exports = router;
