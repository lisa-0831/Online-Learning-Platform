require("dotenv").config();
const { API_VERSION } = process.env;

// Express Initialization
const express = require("express");
const app = express();

// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// API routes
app.use("/api/" + API_VERSION, [require("./server/routes/course_route")]);

app.get("/", function (req, res) {
  res.send("Hello!");
});

app.listen(process.env.PORT);
