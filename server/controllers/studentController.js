const User = require("../models/User");
const Record = require("../models/Record");
const Registration = require("../models/Registration");
const { getEligibleOfferings, PASSING_GRADES } = require("../utils/rulesEngine");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/students   (advisor, admin) - advisor-safe student list
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("-passwordHash")
    .sort({ name: 1 });
  res.json(students);
});

// GET /api/students/:id/registrations   (advisor) - what a student currently
// holds (registered) or has pending (requested), so an advisor knows what
// can be approved/dropped.
const getStudentRegistrations = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const registrations = await Registration.find({
    student: req.params.id,
    status: { $in: ["requested", "registered"] },
  }).populate({ path: "offering", populate: { path: "course" } });

  res.json(registrations);
});

// GET /api/students/:id/record   (advisor, or the student themself)
const getStudentRecord = asyncHandler(async (req, res) => {
  if (req.user.role === "student" && req.user.id !== req.params.id) {
    return res.status(403).json({ message: "You can only view your own record" });
  }

  const student = await User.findById(req.params.id).select("-passwordHash");
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const records = await Record.find({ student: req.params.id })
    .populate("course")
    .sort({ term: 1 });

  let totalCredits = 0;
  const retakesRequired = [];
  for (const r of records) {
    if (PASSING_GRADES.includes(r.grade)) totalCredits += r.credits;
    if (r.grade === "F") retakesRequired.push(r.course.code);
  }

  res.json({
    student: { id: student._id, name: student.name, studentId: student.studentId },
    records,
    totalCreditsEarned: totalCredits,
    retakesRequired,
  });
});

// GET /api/students/:id/eligible?term=1/2026   (advisor)   <- the rules engine
const getStudentEligible = asyncHandler(async (req, res) => {
  const { term } = req.query;
  if (!term) return res.status(400).json({ message: "term query param is required" });

  const student = await User.findById(req.params.id);
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const offerings = await getEligibleOfferings(req.params.id, term);
  res.json(offerings);
});

// GET /api/me/registrations   (student)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    student: req.user.id,
    status: { $in: ["requested", "registered"] },
  }).populate({ path: "offering", populate: { path: "course" } });

  res.json(registrations);
});

// GET /api/me/record   (student)
const getMyRecord = asyncHandler(async (req, res) => {
  req.params.id = req.user.id;
  return getStudentRecord(req, res);
});

module.exports = {
  getAllStudents,
  getStudentRegistrations,
  getStudentRecord,
  getStudentEligible,
  getMyRegistrations,
  getMyRecord,
};