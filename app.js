const express = require("express");
const app = express();
/* const { getTopics, getArticleById, getAllArticles, getCommentsById, postCommentById, patchVotesById, removeCommentById, getAllUsers } = require("./controllers"); */



const apiRouter = require('./routes/api-router')

app.use('/api', apiRouter)


app.use(express.json());

/* app.get("/api/topics", getTopics);

app.get("/api", (req, res, next) => {
  res.status(200).send(endpoints);
});

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles)

app.get("/api/articles/:article_id/comments", getCommentsById)

app.post("/api/articles/:article_id/comments", postCommentById)

app.patch("/api/articles/:article_id",patchVotesById)

app.delete("/api/comments/:comment_id", removeCommentById)

app.get("/api/users", getAllUsers) */

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Invalid path" });
});

app.use((err, req, res, next) => {
  if (err.code === "42702") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "42703") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    if(err.detail.includes('is not present')){res.status(404).send({ msg: "Invalid input" });}
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
    res.status(500).send({ msg: "internal server error" });
  });

module.exports = app;
