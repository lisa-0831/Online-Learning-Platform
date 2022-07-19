const router = require("express").Router();
const {
  errorHandler,
  courseUpload,
  livestreamUpload,
} = require("../../util/util");
const { createCourse } = require("../controllers/course_controller");
const { createLivestream } = require("../controllers/livestream_controller");

router.route("/admin/course").post(courseUpload, errorHandler(createCourse));
router
  .route("/admin/livestream")
  .post(livestreamUpload, errorHandler(createLivestream));

module.exports = router;
