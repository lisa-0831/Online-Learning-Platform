require("dotenv").config();
const { API_VERSION } = process.env;

// Express Initialization
const express = require("express");
const app = express();

// Socketio
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const formatMessage = require("./util/messages");

// Multer
const multer = require("multer");
const upload = multer();

// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(express.static("public"));

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/course_route"),
  require("./server/routes/user_route"),
  require("./server/routes/admin_route"),
  require("./server/routes/comment_route"),
  require("./server/routes/favorites_route"),
  require("./server/routes/order_route"),
  require("./server/routes/messenger_route"),
]);

io.on("connection", (socket) => {
  console.log(`New Connection: ${socket.id} ...`);

  // User Join the Room
  socket.on("user_join", (user) => {
    socket.join(user.room);
  });

  // Listen for Message
  socket.on("send_message", (playload) => {
    io.to(playload.room).emit("receive_message", formatMessage(playload));
  });

  socket.on("disconnet", () => {
    console.log(`${socket.id} has left the chat...`);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}!`)
);
