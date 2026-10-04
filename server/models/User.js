const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "advisor", "student"],
      required: true,
      index: true,
    },
    program: { type: String, trim: true },
    yearLevel: { type: Number, min: 1, max: 10 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, active: 1 });

module.exports = mongoose.model("User", userSchema);
