const Offering = require("../models/Offering");
const Course = require("../models/Course");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/offerings?term=2026-1   (advisor, student)
const getOfferings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.term) filter.term = req.query.term;
  const offerings = await Offering.find(filter).populate("courseId").sort({ section: 1 });
  res.json(offerings);
});

// POST /api/offerings   (advisor only) - open a course section for a term
const createOffering = asyncHandler(async (req, res) => {
  const { courseId, term, section, day, startTime, endTime, room, instructor, seats } = req.body;

  if (!courseId || !term || !section || !day || !startTime || !endTime || !room || !instructor || seats == null) {
    return res.status(400).json({ message: "Missing required offering fields" });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const offering = await Offering.create({
    courseId,
    term,
    section,
    day,
    startTime,
    endTime,
    room,
    instructor,
    seats,
    seatsTaken: 0,
  });

  await offering.populate("courseId");
  res.status(201).json(offering);
});

// PATCH /api/offerings/:id   (advisor only) - edit fields, or open/close add-drop
const updateOffering = asyncHandler(async (req, res) => {
  const offering = await Offering.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("courseId");

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