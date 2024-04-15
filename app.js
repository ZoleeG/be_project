const express = require("express");
const app = express();
const { getTopics, getArticleById } = require("./controllers/get_topics");
const endpoints = require("./endpoints.json");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", (req, res, next) => {
  res.status(200).send(endpoints);
});

app.get("/api/articles/:article_id", getArticleById);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Invalid path" });
});

app.use((err, req, res, next) => {
    const {status, msg} = err
  if (status && msg) {
    res.status(status).send({ msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
    resp.status(500).send({ msg: "internal server error" });
  });

module.exports = app;
