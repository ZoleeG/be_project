const express = require("express");
const app = express();
const {getTopics} = require('./controllers/get_topics')

app.use(express.json());

app.get("/api/topics", getTopics);

app.all("*", (req, res, next) => {
    res.status(400).send({ msg: "Bad request" });
  });

module.exports = app;