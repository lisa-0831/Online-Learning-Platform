const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const { createComment } = require("../controllers/comment_controller");

router.route("/comment").post(errorHandler(createComment));

module.exports = router;
