const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  getLivestreams,
  bookLivestream,
} = require("../controllers/livestream_controller");

router.route("/livestreams/:category").get(errorHandler(getLivestreams));
router.route("/livestreams/book").post(errorHandler(bookLivestream));

module.exports = router;
