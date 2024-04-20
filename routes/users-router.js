const usersRouter = require('express').Router()
const { getAllUsers } = require("../controllers");

usersRouter.get("/", getAllUsers)

module.exports = usersRouter