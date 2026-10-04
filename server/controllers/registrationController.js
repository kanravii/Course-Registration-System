const Registration = require("../models/Registration");
const Offering = require("../models/Offering");
const { getEligibleOfferings } = require("../utils/rulesEngine");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/registrations   (advisor only) - directly register a student,
// bypassing the "requested" pending step. Used when an advisor enrolls
// someone themselves rather than approving a student's own request.
// Body: { student, offering, term }
const createRegistration = asyncHandler(async (req, res) => {
  const { student, offering: offeringId, term } = req.body;
  if (!student || !offeringId || !term) {
    return res.status(400).json({ message: "student, offering and term are required" });
  }

  const offering = await Offering.findById(offeringId);
  if (!offering) return res.status(404).json({ message: "Offering not found" });

  // Re-run eligibility server-side - never trust the client's filtered list.
  const eligibleList = await getEligibleOfferings(student, term);
  const match = eligibleList.find((o) => String(o.offeringId) === String(offeringId));
  if (!match || !match.eligible) {
    return res.status(400).json({
      message: match?.reason || "This course is not eligible for this student",
    });
  }

  const registration = await Registration.create({
    student,
    offering: offeringId,
    status: "registered",
    registeredAt: new Date(),
  });

  offering.enrolledCount += 1;
  await offering.save();

  await registration.populate({ path: "offering", populate: { path: "course" } });
  res.status(201).json(registration);
});

// POST /api/registrations/request   (student) - the add/drop self-service flow.
// Creates a "requested" registration that an advisor must approve before it
// counts as a real seat (doesn't touch enrolledCount yet).
const requestRegistration = asyncHandler(async (req, res) => {
  const { offering: offeringId, term } = req.body;
  if (!offeringId || !term) {
    return res.status(400).json({ message: "offering and term are required" });
  }

  const offering = await Offering.findById(offeringId);
  if (!offering) return res.status(404).json({ message: "Offering not found" });
  if (offering.status !== "open") {
    return res.status(400).json({ message: "Add/drop is not open for this offering" });
  }

  const eligibleList = await getEligibleOfferings(req.user.id, term);
  const match = eligibleList.find((o) => String(o.offeringId) === String(offeringId));
  if (!match || !match.eligible) {
    return res.status(400).json({
      message: match?.reason || "This course is not eligible for you",
    });
  }

  const registration = await Registration.create({
    student: req.user.id,
    offering: offeringId,
    status: "requested",
  });

  await registration.populate({ path: "offering", populate: { path: "course" } });
  res.status(201).json(registration);
});

// PATCH /api/registrations/:id/approve   (advisor) - approve a pending request.
const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ message: "Registration not found" });
  if (registration.status !== "requested") {
    return res.status(400).json({ message: "Only pending requests can be approved" });
  }

  const offering = await Offering.findById(registration.offering);
  if (offering.enrolledCount >= offering.capacity) {
    return res.status(400).json({ message: "No seats remaining" });
  }

  registration.status = "registered";
  registration.registeredAt = new Date();
  await registration.save();

  offering.enrolledCount += 1;
  await offering.save();

  await registration.populate({ path: "offering", populate: { path: "course" } });
  res.json(registration);
});

// PATCH /api/registrations/:id/reject   (advisor) - reject a pending request.
const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ message: "Registration not found" });
  if (registration.status !== "requested") {
    return res.status(400).json({ message: "Only pending requests can be rejected" });
  }

  registration.status = "rejected";
  await registration.save();
  res.json(registration);
});

// DELETE /api/registrations/:id   (advisor only) - drop an existing registration.
const deleteRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ message: "Registration not found" });

  if (registration.status === "registered") {
    const offering = await Offering.findById(registration.offering);
    if (offering && offering.enrolledCount > 0) {
      offering.enrolledCount -= 1;
      await offering.save();
    }
  }

  registration.status = "dropped";
  await registration.save();
  res.json({ message: "Registration dropped", id: req.params.id });
});

module.exports = {
  createRegistration,
  requestRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
};