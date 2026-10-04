const User = require("../models/User");
const Record = require("../models/Record");
const Registration = require("../models/Registration");
const { getEligibleOfferings, PASSING_GRADES } = require("../utils/rulesEngine");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/students/:id/record   (advisor, or the student themself)
const getStudentRecord = asyncHandler(async (req, res) => {
  // A student may only view their OWN record; an advisor may view any student's.
  if (req.user.role === "student" && req.user.id !== req.params.id) {
    return res.status(403).json({ message: "You can only view your own record" });
  }

  const student = await User.findById(req.params.id).select("-passwordHash");
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const records = await Record.find({ studentId: req.params.id })
    .populate("courseId")
    .sort({ term: 1 });

  // Simple GPA-style summary: count passed credits and flag retakes needed.
  let totalCredits = 0;
  const retakesRequired = [];
  for (const r of records) {
    if (PASSING_GRADES.includes(r.grade)) totalCredits += r.courseId.credits;
    if (r.grade === "F") retakesRequired.push(r.courseId.code);
  }

  res.json({
    student: { id: student._id, name: student.name, studentId: student.studentId },
    records,
    totalCreditsEarned: totalCredits,
    retakesRequired,
  });
});

// GET /api/students/:id/eligible?term=2026-1   (advisor)   <- the rules engine
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

// GET /api/me/registrations   (student - their own current-term registrations)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    studentId: req.user.id,
    status: "registered",
  }).populate({ path: "offeringId", populate: { path: "courseId" } });

  res.json(registrations);
});

// GET /api/me/record   (student - their own completed-course history)
const getMyRecord = asyncHandler(async (req, res) => {
  req.params.id = req.user.id;
  return getStudentRecord(req, res);
});

module.exports = { getStudentRecord, getStudentEligible, getMyRegistrations, getMyRecord };