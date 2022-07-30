const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const { addFavorites } = require("../controllers/favorites_controller");

router.route("/favorites").post(errorHandler(addFavorites));

module.exports = router;
