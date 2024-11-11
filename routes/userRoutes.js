const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post('/register',userController.signUp);
router.post('/login',userController.login);

module.exports =router;