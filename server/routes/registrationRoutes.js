const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { createRegistration, deleteRegistration } = require("../controllers/registrationController");

router.post("/", verifyToken, requireRole("advisor"), createRegistration);
router.delete("/:id", verifyToken, requireRole("advisor"), deleteRegistration);

module.exports = router;