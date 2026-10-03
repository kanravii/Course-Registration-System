// A Record is one completed (or failed / withdrawn) course from a PAST term.
// This is what the rules engine reads to decide "already passed" / "must retake".

const mongoose = require("mongoose");
const recordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    term: { type: String, required: true },
    grade: {
      type: String,
      required: true,
      enum: ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);