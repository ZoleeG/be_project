const { getArticleById, getAllArticles, getCommentsById, postCommentById, patchVotesById } = require("../controllers");

const express = require("express");

const articlesRouter = require('express').Router()

articlesRouter.use(express.json())

articlesRouter.get("/", getAllArticles)

articlesRouter
.route("/:article_id")
.get(getArticleById)
.patch(patchVotesById)

articlesRouter
.route('/:article_id/comments')
.get(getCommentsById)
.post(postCommentById)

module.exports = articlesRouter