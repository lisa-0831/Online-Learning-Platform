const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const { getCourses } = require("../controllers/course_controller");

router.route("/courses/:category").get(errorHandler(getCourses));

module.exports = router;
