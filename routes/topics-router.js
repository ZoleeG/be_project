const topicsRouter = require('express').Router()
const {getTopics, postNewTopic, removeTopicBySlug} = require("../controllers");
const express = require("express")
topicsRouter.use(express.json())

topicsRouter
.route("/")
.get(getTopics)
.post(postNewTopic)

topicsRouter
.route("/:slug")
.delete(removeTopicBySlug)

module.exports = topicsRouter