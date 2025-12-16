const express = require("express");
const { registeruser, loginuser } = require("../authController.js");

const router = express.Router();

router.post("/register", registeruser);
router.post("/login", loginuser);

module.exports = router;
