const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getMyRegistrations, getMyRecord } = require("../controllers/studentController");
const { getMe } = require("../controllers/userController");

// fix #4: works for ANY logged-in role, not just students - the token alone
// tells us who's asking, so there's nothing role-specific to check here.
router.get("/", verifyToken, getMe);

// Convenience routes so the logged-in student doesn't need to know their own ID.
router.get("/registrations", verifyToken, requireRole("student"), getMyRegistrations);
router.get("/record", verifyToken, requireRole("student"), getMyRecord);

module.exports = router;