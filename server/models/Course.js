// Course example : CSC220 Web Development II
// term/schedule info are not added here since this is the info of the course only and courses can be added to many terms/sessions

const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
