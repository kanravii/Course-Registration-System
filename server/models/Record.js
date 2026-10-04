const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    term: { type: String, required: true, trim: true, maxlength: 40 },
    attempt: { type: Number, required: true, min: 1, default: 1 },
    grade: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "F", "I", "W", "P", "NP"],
    },
    credits: { type: Number, required: true, min: 1, max: 12 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

recordSchema.index({ student: 1, course: 1, attempt: 1 }, { unique: true });
recordSchema.index({ student: 1, term: 1 });

module.exports = mongoose.model("Record", recordSchema);
