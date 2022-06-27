const Order = require("../models/order_model");

const getCartList = async (req, res) => {
  try {
    const shoppingList = req.headers.data;

    const authorization = req.headers.authorization;
    let token = "";
    if (authorization !== undefined) {
      token = authorization.split(" ")[1];
    }
    shoppingListWithDetail = await Order.getCartList(shoppingList, token);
    return res.status(200).send({ data: shoppingListWithDetail });
  } catch (error) {
    return res.status(500).json({ Error: error });
  }
};

const orderCheckout = async (req, res) => {
  try {
    const { prime, order } = req.body;

    const authorization = req.headers.authorization;
    let token = "";
    if (authorization !== undefined) {
      token = authorization.split(" ")[1];
    }
    const orderId = await Order.checkout(prime, order, token);
    console.log(orderId);

    if (orderId == -1) {
      return res.status(500).json({ Error: error });
    } else {
      return res.status(200).json({ data: orderId });
    }
  } catch (error) {
    return res.status(500).json({ Error: error });
  }
};

module.exports = {
  getCartList,
  orderCheckout,
};
