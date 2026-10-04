const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getStudentRecord, getStudentEligible } = require("../controllers/studentController");

// A student may fetch their own record (checked inside the controller);
// an advisor may fetch any student's record.
router.get("/:id/record", verifyToken, requireRole("advisor", "student"), getStudentRecord);
router.get("/:id/eligible", verifyToken, requireRole("advisor"), getStudentEligible);

module.exports = router;