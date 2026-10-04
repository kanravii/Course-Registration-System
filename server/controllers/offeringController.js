const Offering = require("../models/Offering");
const Course = require("../models/Course");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/offerings?term=1/2026   (advisor, student, admin)
const getOfferings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.term) filter.term = req.query.term;
  const offerings = await Offering.find(filter)
    .populate("course")
    .populate("instructor", "name email")
    .sort({ section: 1 });
  res.json(offerings);
});

// POST /api/offerings   (advisor only)
const createOffering = asyncHandler(async (req, res) => {
  const {
    course: courseId,
    term,
    section,
    instructor,
    capacity,
    schedule,
    registrationOpensAt,
    registrationClosesAt,
    status,
  } = req.body;

  if (!courseId || !term || !section || !instructor || capacity == null || !registrationOpensAt || !registrationClosesAt) {
    return res.status(400).json({ message: "Missing required offering fields" });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const offering = await Offering.create({
    course: courseId,
    term,
    section,
    instructor,
    capacity,
    enrolledCount: 0,
    schedule: schedule || [],
    registrationOpensAt,
    registrationClosesAt,
    status: status || "draft",
  });

  await offering.populate("course");
  await offering.populate("instructor", "name email");
  res.status(201).json(offering);
});

// PATCH /api/offerings/:id   (advisor only) - edit fields, or change status
// open/closed to control the add/drop window.
const updateOffering = asyncHandler(async (req, res) => {
  const offering = await Offering.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("course")
    .populate("instructor", "name email");

  if (!offering) return res.status(404).json({ message: "Offering not found" });
  res.json(offering);
});

// DELETE /api/offerings/:id   (advisor only)
const deleteOffering = asyncHandler(async (req, res) => {
  const offering = await Offering.findByIdAndDelete(req.params.id);
  if (!offering) return res.status(404).json({ message: "Offering not found" });
  res.json({ message: "Offering deleted", id: req.params.id });
});

module.exports = { getOfferings, createOffering, updateOffering, deleteOffering };