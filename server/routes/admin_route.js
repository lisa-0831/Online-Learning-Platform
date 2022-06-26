const router = require("express").Router();
const { errorHandler, cpUpload } = require("../../util/util");
const { createCourse } = require("../controllers/course_controller");

router.route("/admin/course").post(cpUpload, errorHandler(createCourse));

module.exports = router;
