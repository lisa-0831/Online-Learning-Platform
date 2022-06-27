const router = require("express").Router();
const { errorHandler } = require("../../util/util");

const {
  getCartList,
  orderCheckout,
} = require("../controllers/order_controller");

router.route("/order/list").get(errorHandler(getCartList));
router.route("/order/checkout").post(errorHandler(orderCheckout));

module.exports = router;
