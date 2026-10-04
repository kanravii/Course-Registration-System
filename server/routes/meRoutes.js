const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getMyRegistrations, getMyRecord } = require("../controllers/studentController");

// Convenience routes so the logged-in student doesn't need to know their own ID.
router.get("/registrations", verifyToken, requireRole("student"), getMyRegistrations);
router.get("/record", verifyToken, requireRole("student"), getMyRecord);

module.exports = router;