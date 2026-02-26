const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { profile } = require("../controllers/profile");

router.get("/profile", authMiddleware, profile);

module.exports = router;