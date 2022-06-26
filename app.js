require("dotenv").config();

// Express Initialization
const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("Hello!");
});

app.listen(process.env.PORT);
