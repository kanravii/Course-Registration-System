const mongoose = require("mongoose");

// A Registration links a student to an offering for the current term.
// "requested" is the add/drop workflow's pending state - a student requests
// a seat, and it becomes "registered" once an advisor approves it (or is
// created directly as "registered" when an advisor enrolls someone themselves).
const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offering: { type: mongoose.Schema.Types.ObjectId, ref: "Offering", required: true },
    status: {
      type: String,
      enum: ["requested", "registered", "dropped", "rejected"],
      default: "requested",
    },
    registeredAt: { type: Date }, // set once status becomes "registered"
  },
  { timestamps: true }
);

registrationSchema.index({ student: 1, offering: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);