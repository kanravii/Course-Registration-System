const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getCourses } = require("../controllers/courseController");

router.get("/", verifyToken, requireRole("advisor", "admin"), getCourses);

module.exports = router;