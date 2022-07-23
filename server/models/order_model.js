require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET, PARTNER_KEY, TAPPAY_URL } = process.env;
const jwt = require("jsonwebtoken");

const axios = require("axios").default;

const getCartList = async (shoppingList, token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);
    const [shoppingListWithDetail] = await pool.query(
      `SELECT l.id, l.title, l.price, l.cover, 
      CASE WHEN r.user_id IS NULL THEN 0 ELSE 1 END AS 'student_in_course' 
      FROM ( 
        SELECT * FROM course 
        WHERE id IN (${shoppingList})) l 
      LEFT JOIN (
        SELECT * 
        FROM course_student 
        WHERE user_id = ?) r 
      ON l.id = r.course_id`,
      [decoded.userId]
    );

    return shoppingListWithDetail;
  } catch (error) {
    return { Error: error };
  }
};

const checkout = async (prime, order, token) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    // Verify token
    const decoded = jwt.verify(token, TOKEN_SECRET);
    const { payment, total, list } = order;

    // Insert data into Table orders
    const [orderObject] = await conn.query(
      "INSERT INTO pi.order (user_id, total, paid) VALUES (?,?,?)",
      [decoded.userId, order.total, 0]
    );
    order_id = orderObject.insertId;

    // Insert data into Table orderitems
    let orderAndCourse = [];
    let userAndCourse = [];
    for (let i = 0; i < list.length; i++) {
      let orderArr = [order_id, list[i]];
      orderAndCourse.push(orderArr);
      let userArr = [decoded.userId, list[i]];
      userAndCourse.push(userArr);
    }

    await conn.query(
      `INSERT INTO pi.order_item ( order_id, course_id ) VALUES ?`,
      [orderAndCourse]
    );

    // start to pay the bill!
    const tappay_header = {
      "Content-Type": "application/json",
      "x-api-key": PARTNER_KEY,
    };

    const tappay_body = {
      prime: prime,
      partner_key: PARTNER_KEY,
      merchant_id: MERCHANT_ID,
      amount: total,
      order_number: order_id,
      currency: "TWD",
      details: `order id: ${order_id}`,
      cardholder: {
        phone_number: 0987654321,
        name: decoded.name,
        email: decoded.email,
      },
      remember: false,
    };

    const tappay_result = await axios.post(TAPPAY_URL, tappay_body, {
      headers: tappay_header,
    });

    if (tappay_result.status === 200) {
      await conn.query(
        `INSERT INTO pi.course_student ( user_id, course_id ) VALUES ?`,
        [userAndCourse]
      );
      await conn.query(`UPDATE pi.order SET paid = ? WHERE id = ?`, [
        1,
        order_id,
      ]);
      await conn.query("INSERT INTO pi.payment SET ?", {
        order_id: order_id,
        payment_method: payment,
        rec_trade_id: tappay_result.data["rec_trade_id"],
        transaction_time: tappay_result.data["transaction_time_millis"],
      });

      await conn.query("COMMIT");
      return order_id;
    } else {
      await conn.query("COMMIT");
      return -1;
    }
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  getCartList,
  checkout,
};
