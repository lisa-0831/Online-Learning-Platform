// const moment = require("moment");

function formatMessage(payload) {
  let date = new Date(Date.now());
  return {
    room: payload.room,
    userId: payload.userId,
    message: {
      text: payload.message.text,
      username: payload.message.username,
      // time: moment().format("h:mm a"),
      // time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      time: Date.now(),
    },
  };
}

module.exports = formatMessage;
