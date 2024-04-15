const express = require("express");
const app = express();
const {getTopics} = require('./controllers/get_topics')
const endpoints = require('./endpoints.json')

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", (req, res, next) => {
    res.status(200).send(endpoints)
})

app.all("*", (req, res, next) => {
    res.status(404).send({ msg: "Invalid path" });
  });

module.exports = app;