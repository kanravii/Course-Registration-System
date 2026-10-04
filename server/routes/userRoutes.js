const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

// Every route here is admin-only, enforced on the server (not just hidden in the UI).
router.use(verifyToken, requireRole("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;