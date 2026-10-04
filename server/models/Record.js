const mongoose = require("mongoose");

// A completed (or failed/withdrawn) course attempt from a PAST term.
// "attempt" counts retakes - attempt:1 is the first try, attempt:2 a retake, etc.
// This is what the rules engine reads to decide "already passed" / "must retake".
const recordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    term: { type: String, required: true },
    attempt: { type: Number, required: true, min: 1, default: 1 },
    grade: {
      type: String,
      required: true,
      enum: ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W"],
    },
    credits: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);