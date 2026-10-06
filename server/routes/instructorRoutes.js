const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getInstructors } = require("../controllers/userController");

router.get("/", verifyToken, requireRole("advisor", "admin"), getInstructors);

module.exports = router;