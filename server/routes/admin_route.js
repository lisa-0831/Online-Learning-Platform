const router = require("express").Router();
const { errorHandler, cpUpload, authentication } = require("../../util/util");
const { createCourse } = require("../controllers/course_controller");
const { createLivestream } = require("../controllers/livestream_controller");
const { checkAuth } = require("../controllers/admin_controller");
const { USER_ROLE } = require("../models/user_model");

router.route("/admin/auth").post(authentication(USER_ROLE.TEACHER), checkAuth);

router
  .route("/admin/course")
  .post(
    authentication(USER_ROLE.TEACHER),
    cpUpload,
    errorHandler(createCourse)
  );

router
  .route("/admin/livestream")
  .post(
    authentication(USER_ROLE.TEACHER),
    cpUpload,
    errorHandler(createLivestream)
  );

module.exports = router;
