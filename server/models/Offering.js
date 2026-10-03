// An Offering is one SECTION of a course in a specific term
// e.g. a course might have offerings taught at different times like (section 1 in 2026/1 and section 2 in 2026/1)

const mongoose = require("mongoose");
const offeringSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    term: { type: String, required: true, trim: true }, // e.g. "2026-1"
    section: { type: Number, required: true, min: 1 },
    day: {
      type: String,
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    // Stored as "HH:MM" 24-hour strings so they are easy to compare for clashes.
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true }, // e.g. "10:30"
    room: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 0 },
    seatsTaken: { type: Number, default: 0, min: 0 },
    addDropOpen: { type: Boolean, default: false },
    addDropCloseDate: { type: Date }, // shown to students when window is open
  },
  { timestamps: true }
);

// A given course can't have the same section number twice in the same term.
offeringSchema.index({ courseId: 1, term: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Offering", offeringSchema);