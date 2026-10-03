// A Registration links a student to an offering (section) for a given term.
// This is the CURRENT term's registration, not history - history lives in Record.

const mongoose = require("mongoose");
const registrationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: "Offering", required: true },
    term: { type: String, required: true },
    status: {
      type: String,
      enum: ["registered", "dropped"],
      default: "registered",
    },
  },
  { timestamps: true }
);

// A student can't be registered twice for the same offering.
registrationSchema.index({ studentId: 1, offeringId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);