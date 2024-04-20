const topicsRouter = require('express').Router()
const {getTopics} = require("../controllers");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter