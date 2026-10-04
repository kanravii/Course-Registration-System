const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const {
  getOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
} = require("../controllers/offeringController");

// Advisors AND students can view offerings; only advisors can change them.
router.get("/", verifyToken, requireRole("advisor", "student", "admin"), getOfferings);
router.post("/", verifyToken, requireRole("advisor"), createOffering);
router.patch("/:id", verifyToken, requireRole("advisor"), updateOffering);
router.delete("/:id", verifyToken, requireRole("advisor"), deleteOffering);

module.exports = router;