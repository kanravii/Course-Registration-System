const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: /^[A-Z]{2,6}[0-9]{3,4}$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    credits: { type: Number, required: true, min: 1, max: 12 },
    programs: {
      type: [{ type: String, enum: ["CS", "IT"] }],
      required: true,
      validate: {
        validator: (programs) => programs.length > 0,
        message: "At least one program is required",
      },
    },
    category: {
      type: String,
      enum: ["basic-core", "major-requirement", "major-elective", "internship"],
      required: true,
      index: true,
    },
    yearLevel: { type: Number, min: 1, max: 3, required: true },
    specialization: { type: String, trim: true },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

courseSchema.index({ title: 1 });

module.exports = mongoose.model("Course", courseSchema);
