const mongoose = require("mongoose");

// A single meeting slot (a course can meet multiple times/days per week,
// e.g. Mon/Wed/Fri - that's why schedule is an ARRAY, not single day/time fields).
const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    startTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    room: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false }
);

const offeringSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    term: { type: String, required: true, trim: true, maxlength: 40 },
    section: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    capacity: { type: Number, required: true, min: 1 },
    enrolledCount: { type: Number, default: 0, min: 0 },
    schedule: { type: [scheduleSchema], default: [] },
    registrationOpensAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "cancelled"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

offeringSchema.index({ course: 1, term: 1, section: 1 }, { unique: true });
offeringSchema.index({ term: 1, status: 1 });

offeringSchema.path("enrolledCount").validate(function (value) {
  return value <= this.capacity;
}, "enrolledCount cannot exceed capacity");

offeringSchema.path("registrationClosesAt").validate(function (value) {
  return !this.registrationOpensAt || value > this.registrationOpensAt;
}, "registrationClosesAt must be after registrationOpensAt");

module.exports = mongoose.model("Offering", offeringSchema);