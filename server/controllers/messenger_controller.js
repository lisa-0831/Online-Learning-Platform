const Message = require("../models/messenger_model");

const saveRoomId = async (req, res) => {
  const authorization = req.headers.authorization;
  let token = "";
  if (authorization !== undefined) {
    token = authorization.split(" ")[1];
  }

  const receiverId = req.body.receiverId;
  console.log(11, receiverId);
  const checkId = await Message.addRoom(token, receiverId);

  res.send({ checkId });
};

const saveMessage = async (req, res) => {
  const data = req.body;
  if (!data.room) {
    res
      .status(400)
      .send({ error: "Save Message Error: Please Choose Chatroom First" });
    return;
  } else if (
    !data.userId ||
    !data.message ||
    !data.message.text ||
    !data.message.username
  ) {
    res.status(400).send({ error: "Save Message Error: Wrong Data Format" });
    return;
  }
  const messageId = await Message.addMessage(data);

  res.send({ messageId });
};

const getMessages = async (req, res) => {
  const authorization = req.headers.authorization;
  let token = "";
  if (authorization !== undefined) {
    token = authorization.split(" ")[1];
  }
  const receiverId = req.body.receiverId;

  const category = req.params.category || "all";

  async function findMessage(category) {
    switch (category) {
      case "all": {
        return await Message.getMessages(token, receiverId);
      }
      case "details": {
        const otherSideId = parseInt(req.query.id);
        if (Number.isInteger(otherSideId)) {
          return await Message.getMessage(token, otherSideId);
        }
      }
    }
  }

  const messages = await findMessage(category);
  if (!messages) {
    res.status(400).send({ error: "Wrong Request" });
    return;
  }

  res.send(messages);
};

module.exports = {
  saveMessage,
  getMessages,
  saveRoomId,
};
