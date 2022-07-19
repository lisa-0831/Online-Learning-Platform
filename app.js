require("dotenv").config();
const { API_VERSION } = process.env;

// Express Initialization
const express = require("express");
const app = express();

// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/admin_route"),
  require("./server/routes/course_route"),
  require("./server/routes/user_route"),
  require("./server/routes/comment_route"),
  require("./server/routes/favorites_route"),
  require("./server/routes/order_route"),
  require("./server/routes/messenger_route"),
  require("./server/routes/livestream_route"),
]);

// Socketio
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const formatMessage = require("./util/messages");
const teacherSocketId = {}; // {courseId: socket.id}

io.on("connection", (socket) => {
  console.log(`New Connection: ${socket.id} ...`);

  // Messenger
  socket.on("user_join", (user) => {
    socket.join(user.room);
  });

  socket.on("send_message", (payload) => {
    io.to(payload.room).emit("receive_message", formatMessage(payload));
  });

  // Live Stream
  socket.on("teacher_join", (courseId) => {
    console.log(51, courseId);
    console.log(51);
    teacherSocketId[courseId] = socket.id;
    socket.join(courseId);
  });

  socket.on("student_join", (courseId) => {
    console.log(57, courseId);
    console.log(57);
    socket.join(courseId);
  });

  socket.on("broadcaster", (courseId) => {
    console.log(62);
    io.to(courseId).emit("broadcaster");
  });

  socket.on("viewer", (courseId) => {
    console.log(67);

    socket.to(teacherSocketId[courseId]).emit("viewer", socket.id);
  });

  socket.on("candidate", (id, candidate) => {
    console.log(73);

    socket.to(id).emit("candidate", socket.id, candidate);
  });

  socket.on("offer", (id, description) => {
    console.log(79);

    socket.to(id).emit("offer", socket.id, description);
  });

  socket.on("answer", (id, description) => {
    console.log(85);

    socket.to(id).emit("answer", socket.id, description);
  });

  socket.on("disconnet", () => {
    console.log(`${socket.id} has left the chat...`);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}!`)
);
