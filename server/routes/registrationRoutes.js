const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const {
  createRegistration,
  requestRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");

router.post("/", verifyToken, requireRole("advisor"), createRegistration);
router.post("/request", verifyToken, requireRole("student"), requestRegistration);
router.patch("/:id/approve", verifyToken, requireRole("advisor"), approveRegistration);
router.patch("/:id/reject", verifyToken, requireRole("advisor"), rejectRegistration);
router.delete("/:id", verifyToken, requireRole("advisor"), deleteRegistration);

module.exports = router;