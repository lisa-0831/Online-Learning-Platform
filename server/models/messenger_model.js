require("dotenv").config();

const { pool } = require("./mysqlcon");
const { TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const addMessage = async (data) => {
  const conn = await pool.getConnection();
  try {
    let receiverId = 0;
    const bothSides = data.room.split(",");
    for (let i = 0; i < bothSides.length; i++) {
      if (parseInt(bothSides[i]) !== data.userId) {
        receiverId = parseInt(bothSides[i]);
      }
    }

    const messageInfo = {
      room: data.room,
      sender_id: data.userId,
      receiver_id: receiverId,
      content: data.message.text,
      create_time: Date.now(),
    };

    await conn.query(
      "UPDATE message_check \
      SET last_time=? \
      WHERE room=? AND user_id=?",
      [Date.now(), data.room, data.userId]
    );

    const [result] = await conn.query("INSERT INTO message SET ?", messageInfo);
    return result.insertId;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const getMessages = async (token) => {
  const decoded = jwt.verify(token, TOKEN_SECRET);
  const userId = decoded.userId;
  const username = decoded.name;

  const conn = await pool.getConnection();
  try {
    const [messages] = await conn.query(
      "SELECT msg.room, msg.sender_id, msg.receiver_id, msg.content, msg.create_time, \
      sender_info.name AS sender_name, sender_info.picture AS sender_pic, \
      receiver_info.name AS receiver_name, receiver_info.picture AS receiver_pic \
      FROM ( \
     SELECT * FROM message \
     WHERE id in \
     (SELECT MAX(id) FROM message WHERE sender_id = ? OR receiver_id = ? GROUP BY room) \
     ) AS msg LEFT JOIN user AS sender_info on msg.sender_id = sender_info.id LEFT JOIN user AS receiver_info on msg.receiver_id = receiver_info.id \
     ORDER BY create_time DESC;",
      [userId, userId]
    );

    const [count] = await conn.query(
      "SELECT msg_count.room, COUNT(msg_count.create_time) AS msg_num, MAX(msg_count.create_time) AS last_msg \
    FROM (SELECT pi.message.room, pi.message.create_time \
    FROM pi.message \
    WHERE receiver_id = ?) AS msg_count \
    LEFT JOIN (SELECT * \
    FROM pi.message_check \
    WHERE pi.message_check.user_id = ?) AS last_check \
    ON msg_count.room = last_check.room \
    WHERE msg_count.create_time > last_check.last_time OR last_check.last_time IS NULL \
    GROUP BY msg_count.room \
    ORDER BY last_msg DESC",
      [userId, userId]
    );

    const roomToMsgNum = {};
    for (let i = 0; i < count.length; i++) {
      roomToMsgNum[count[i].room] = {
        msg_num: count[i].msg_num,
        last_msg: count[i].last_msg,
      };
    }

    const user = {
      id: userId,
      name: username,
    };

    return { messages: messages, count: roomToMsgNum, user: user };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const getMessage = async (token, otherSideId) => {
  const decoded = jwt.verify(token, TOKEN_SECRET);
  const userId = decoded.userId;
  const username = decoded.name;

  let room = [userId, otherSideId];
  room.sort(function (a, b) {
    return a - b;
  });
  room = room.toString();

  // Database
  const conn = await pool.getConnection();
  try {
    const [messages] = await conn.query(
      "SELECT pi.message.room, pi.message.sender_id, pi.message.receiver_id, pi.message.content, pi.message.create_time, pi.user.name, pi.user.picture \
    FROM pi.message \
    LEFT JOIN pi.user \
    ON pi.message.sender_id = pi.user.id \
    WHERE room = ?",
      [room]
    );

    await conn.query(
      "UPDATE message_check \
      SET last_time=? \
      WHERE room=? AND user_id=?",
      [Date.now(), room, userId]
    );

    const user = {
      id: userId,
      name: username,
      room: room,
    };
    return { user: user, messages: messages };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

module.exports = {
  addMessage,
  getMessage,
  getMessages,
};
