const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const {
  getAllStudents,
  getStudentRegistrations,
  getStudentRecord,
  getStudentEligible,
} = require("../controllers/studentController");

// fix #1: advisor-safe student list (narrower than the admin-only /api/users)
router.get("/", verifyToken, requireRole("advisor", "admin"), getAllStudents);

// fix #2: what a student is currently registered for, so an advisor can drop one
router.get("/:id/registrations", verifyToken, requireRole("advisor"), getStudentRegistrations);

// A student may fetch their own record (checked inside the controller);
// an advisor may fetch any student's record.
router.get("/:id/record", verifyToken, requireRole("advisor", "student"), getStudentRecord);
router.get("/:id/eligible", verifyToken, requireRole("advisor"), getStudentEligible);

module.exports = router;