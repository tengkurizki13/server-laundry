const express = require("express");
const AuthController = require("../controllers/AuthController");
const router = express.Router();

router.post("/api/login", AuthController.login);
module.exports = router;
