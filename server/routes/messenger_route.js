const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  saveMessage,
  getMessages,
  saveRoomId,
} = require("../controllers/messenger_controller");

router.route("/messages/:category").get(errorHandler(getMessages));
router.route("/messages").post(errorHandler(saveMessage));
router.route("/messages/newroom").post(errorHandler(saveRoomId));

module.exports = router;
