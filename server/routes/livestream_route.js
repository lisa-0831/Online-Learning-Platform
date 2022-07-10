const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const { getLivestreams } = require("../controllers/livestream_controller");

router.route("/livestreams/:category").get(errorHandler(getLivestreams));

module.exports = router;
