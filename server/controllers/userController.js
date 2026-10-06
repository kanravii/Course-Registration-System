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
  const { name, email, role, studentId, employeeId, program, yearLevel, advisorId, password } =
    req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ message: "name, email, role and password are required" });
  }
  if (role === "student" && !studentId) {
    return res.status(400).json({ message: "studentId is required for student accounts" });
  }
  if ((role === "admin" || role === "advisor") && !employeeId) {
    return res.status(400).json({ message: "employeeId is required for admin/advisor accounts" });
  }

  if (advisorId) {
    const advisor = await User.findById(advisorId);
    if (!advisor || advisor.role !== "advisor") {
      return res.status(400).json({ message: "advisorId must reference an existing advisor" });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role,
    studentId: role === "student" ? studentId : undefined,
    employeeId: role !== "student" ? employeeId : undefined,
    program: role === "student" ? program : undefined,
    yearLevel: role === "student" ? yearLevel : undefined,
    advisorId: role === "student" ? advisorId || null : undefined,
    passwordHash,
  });

  const { passwordHash: _omit, ...safeUser } = user.toObject();
  res.status(201).json(safeUser);
});

// PATCH /api/users/:id   (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;

  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: "User not found" });

  const wouldStopBeingAdmin =
    target.role === "admin" &&
    ((updates.role && updates.role !== "admin") || updates.active === false);

  if (wouldStopBeingAdmin) {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res
        .status(400)
        .json({ message: "Cannot demote or deactivate the last remaining admin" });
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  res.json(user);
});

// DELETE /api/users/:id   (admin only)
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

  await target.deleteOne();
  res.json({ message: "User deleted", id: req.params.id });
});

const getInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: "advisor" })
    .select("-passwordHash")
    .sort({ name: 1 });
  res.json(instructors);
});

// GET /api/me   (any authenticated role) - own profile, advisor populated.
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-passwordHash")
    .populate("advisorId", "name email");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = { getUsers, createUser, updateUser, deleteUser, getMe, getInstructors };