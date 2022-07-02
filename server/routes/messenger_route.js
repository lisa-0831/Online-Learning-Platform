const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  saveMessage,
  getMessages,
} = require("../controllers/messenger_controller");

router.route("/messages/:category").get(errorHandler(getMessages));
router.route("/messages").post(errorHandler(saveMessage));

module.exports = router;
