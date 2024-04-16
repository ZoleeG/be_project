const express = require("express");
const app = express();
const { getTopics, getArticleById, getAllArticles, getCommentsById, postCommentById, patchVotesById } = require("./controllers");
const endpoints = require("./endpoints.json");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", (req, res, next) => {
  res.status(200).send(endpoints);
});

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles)

app.get("/api/articles/:article_id/comments", getCommentsById)

app.post("/api/articles/:article_id/comments", postCommentById)

app.patch("/api/articles/:article_id",patchVotesById)

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Invalid path" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
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
