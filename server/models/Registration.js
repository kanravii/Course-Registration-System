const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    offering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offering",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["requested", "registered", "waitlisted", "dropped", "completed"],
      default: "requested",
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    registeredAt: Date,
    droppedAt: Date,
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F", "I", "W", "P", "NP"],
    },
  },
  { timestamps: true },
);

registrationSchema.index({ student: 1, offering: 1 }, { unique: true });
registrationSchema.index({ offering: 1, status: 1 });

module.exports = mongoose.model("Registration", registrationSchema);
