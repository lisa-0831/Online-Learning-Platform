const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/assets/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const cpUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

const errorHandler = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  cpUpload,
  errorHandler,
};
