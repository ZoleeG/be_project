const commentsRouter = require("express").Router();
const { removeCommentById, patchCommentVotesById } = require("../controllers");

const express = require("express");

commentsRouter.use(express.json())

commentsRouter
.route("/:comment_id")
.delete(removeCommentById)
.patch(patchCommentVotesById)

module.exports = commentsRouter;
