const Registration = require("../models/Registration");
const Offering = require("../models/Offering");
const { getEligibleOfferings } = require("../utils/rulesEngine");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/registrations   (advisor only) - register a student for a section
// Body: { studentId, offeringId, term }
//
// IMPORTANT: the advisor's UI already filtered the list using the rules
// engine, but we re-check on the server too - never trust the client.
const createRegistration = asyncHandler(async (req, res) => {
  const { studentId, offeringId, term } = req.body;
  if (!studentId || !offeringId || !term) {
    return res.status(400).json({ message: "studentId, offeringId and term are required" });
  }

  const offering = await Offering.findById(offeringId);
  if (!offering) return res.status(404).json({ message: "Offering not found" });

  // Re-run the eligibility check server-side for this exact offering.
  const eligibleList = await getEligibleOfferings(studentId, term);
  const match = eligibleList.find((o) => String(o.offeringId) === String(offeringId));
  if (!match || !match.eligible) {
    return res.status(400).json({
      message: match?.reason || "This course is not eligible for this student",
    });
  }

  const registration = await Registration.create({
    studentId,
    offeringId,
    term,
    status: "registered",
  });

  // Keep the seat count in sync.
  offering.seatsTaken += 1;
  await offering.save();

  await registration.populate({ path: "offeringId", populate: { path: "courseId" } });
  res.status(201).json(registration);
});

// DELETE /api/registrations/:id   (advisor only) - remove before term is finalised
const deleteRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ message: "Registration not found" });

  const offering = await Offering.findById(registration.offeringId);
  if (offering && offering.seatsTaken > 0) {
    offering.seatsTaken -= 1;
    await offering.save();
  }

  await registration.deleteOne();
  res.json({ message: "Registration removed", id: req.params.id });
});

module.exports = { createRegistration, deleteRegistration };