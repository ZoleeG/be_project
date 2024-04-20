const { getArticleById, getAllArticles, getCommentsById, postCommentById, patchVotesById } = require("../controllers");

const express = require("express");

const articlesRouter = require('express').Router()

articlesRouter.use(express.json())
//app.use(express.json());

articlesRouter.get("/:article_id", getArticleById);

articlesRouter.get("/", getAllArticles)

articlesRouter.get("/:article_id/comments", getCommentsById)

articlesRouter.post("/:article_id/comments", postCommentById)

articlesRouter.patch("/:article_id",patchVotesById)

module.exports = articlesRouter