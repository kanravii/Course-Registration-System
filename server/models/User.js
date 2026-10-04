const mongoose = require("mongoose");

// One collection for all three roles. Which extra fields matter depends on role:
// - admin/advisor: employeeId
// - student: studentId, program, yearLevel, advisorId
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "advisor", "student"],
      required: true,
    },
    employeeId: { type: String, trim: true }, // admin/advisor only
    studentId: { type: String, trim: true }, // student only
    program: { type: String, enum: ["CS", "IT"] }, // student only
    yearLevel: { type: Number, min: 1 }, // student only
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);