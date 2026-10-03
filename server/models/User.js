// A collection for all 3 roles: student, advisor and admin
// studentID is required and meaningful for students ONLY

const mongoose = require("mongoose");
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
    passwordHash: { type: String, required: true }, // NEVER store plain text passwords
    role: {
      type: String,
      enum: ["admin", "advisor", "student"],
      required: true,
    },
    studentId: {
      type: String,
      trim: true,
      // required only for students - validated in the controller, not here,
      // because admins/advisors legitimately have no studentId
    },
    advisorId: {
      type: mongoose.Schema.Types.ObjectId, // linking students to their advisors
      ref: "User",
      default: null,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
