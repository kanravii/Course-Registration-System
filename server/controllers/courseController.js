const Course = require("../models/Course");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/courses   (advisor, admin) - the catalog, for populating dropdowns
// like "create offering" (fix #3) where you need to pick WHICH course a new
// section belongs to.
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

module.exports = { getCourses };