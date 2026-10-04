const mongoose = require("mongoose");

// A Course is the catalog entry. Scheduling/term info lives in Offering,
// not here, since the same course repeats across many terms/sections.
const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    programs: { type: [String], default: [] }, // e.g. ["CS"], ["IT"], or both
    yearLevel: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      enum: ["basic-core", "major-requirement", "major-elective", "internship"],
      required: true,
    },
    // Courses that must be passed before this one is eligible.
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    specialization: { type: String, trim: true }, // e.g. "Software Engineering" - optional
    credits: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);