// const moment = require("moment");

function formatMessage(playload) {
  let date = new Date(Date.now());
  return {
    room: playload.room,
    userId: playload.userId,
    message: {
      text: playload.message.text,
      username: playload.message.username,
      // time: moment().format("h:mm a"),
      // time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      time: `${date.toLocaleTimeString()}`,
    },
  };
}

module.exports = formatMessage;
