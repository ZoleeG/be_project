const topicsRouter = require('express').Router()
const {getTopics, postNewTopic} = require("../controllers");
const express = require("express")
topicsRouter.use(express.json())

topicsRouter
.route("/")
.get(getTopics)
.post(postNewTopic)


module.exports = topicsRouter