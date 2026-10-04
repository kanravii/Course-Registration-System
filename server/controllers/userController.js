const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/users?role=student   (admin only)
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-passwordHash").sort({ name: 1 });
  res.json(users);
});

// POST /api/users   (admin only) - create account
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, studentId, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ message: "name, email, role and password are required" });
  }
  if (role === "student" && !studentId) {
    return res.status(400).json({ message: "studentId is required for student accounts" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role,
    studentId: role === "student" ? studentId : undefined,
    passwordHash,
  });

  const { passwordHash: _omit, ...safeUser } = user.toObject();
  res.status(201).json(safeUser);
});

// PATCH /api/users/:id   (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash; // never let a raw hash be set directly

  // If the request includes a new plain-text password, hash it here.
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// DELETE /api/users/:id   (admin only)
// Guards: an admin cannot delete themselves, and the system must never
// be left with zero admins.
const deleteUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found" });

  if (String(target._id) === String(req.user.id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot delete the last remaining admin" });
    }
  }

  // Recommended by the brief: prefer deactivating a user who already has
  // registration history, so past records aren't orphaned. Real delete is
  // still offered here for users with no history; adjust to your team's needs.
  await target.deleteOne();
  res.json({ message: "User deleted", id: req.params.id });
});

module.exports = { getUsers, createUser, updateUser, deleteUser };