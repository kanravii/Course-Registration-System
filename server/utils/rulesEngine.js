const Record = require("../models/Record");
const Registration = require("../models/Registration");
const Offering = require("../models/Offering");

// Grades that count as "passed" per the course brief (Section 6).
const PASSING_GRADES = ["A", "B+", "B", "C+", "C", "D+", "D"];

// Convert "HH:MM" to minutes-since-midnight so we can compare times numerically.
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Two time ranges overlap if one starts before the other ends, on the same day.
function timesOverlap(a, b) {
  if (a.day !== b.day) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Builds the eligible/excluded course list for one student in one term.
 * Applies all four rules from Section 6 of the brief and explains every exclusion.
 *
 * @param {ObjectId} studentId
 * @param {String} term  e.g. "2026-1"
 * @returns {Array} one entry per OFFERING (section) in that term, annotated
 */
async function getEligibleOfferings(studentId, term) {
  // 1. All sections open this term, with course details populated.
  const offerings = await Offering.find({ term }).populate("courseId").lean();

  // 2. This student's completed-course history (previous terms).
  const records = await Record.find({ studentId }).lean();

  // 3. This student's CURRENT registrations for this term (for clash checking).
  const currentRegs = await Registration.find({
    studentId,
    term,
    status: "registered",
  }).populate({ path: "offeringId" });

  const currentOfferings = currentRegs
    .map((r) => r.offeringId)
    .filter(Boolean); // in case an offering was deleted

  // Quick lookup: courseId(string) -> best/most-relevant past grade info
  const passedCourseIds = new Set(
    records.filter((r) => PASSING_GRADES.includes(r.grade)).map((r) => String(r.courseId))
  );
  const failedCourseIds = new Set(
    records.filter((r) => r.grade === "F").map((r) => String(r.courseId))
  );

  const results = offerings.map((off) => {
    const courseId = String(off.courseId._id);
    const seatsRemaining = off.seats - off.seatsTaken;

    let eligible = true;
    let reason = null;
    let retakeRequired = failedCourseIds.has(courseId);

    // Rule: Not already passed
    if (passedCourseIds.has(courseId)) {
      const pastGrade = records.find(
        (r) => String(r.courseId) === courseId && PASSING_GRADES.includes(r.grade)
      )?.grade;
      eligible = false;
      reason = `Already passed — grade ${pastGrade}`;
    }

    // Rule: Seats available (only check if not already excluded above)
    if (eligible && seatsRemaining <= 0) {
      eligible = false;
      reason = "Full — 0 seats remaining";
    }

    // Rule: No time clash with a course already selected this term
    if (eligible) {
      const clash = currentOfferings.find(
        (co) =>
          String(co._id) !== String(off._id) && // don't compare against itself
          timesOverlap(off, co)
      );
      if (clash) {
        eligible = false;
        reason = `Clashes with ${clash.courseId ? "" : ""}Section ${clash.section} (${clash.day} ${clash.startTime}-${clash.endTime})`;
      }
    }

    // Rule: Failed courses must be retaken - this OVERRIDES the "already passed"
    // exclusion (a student can retake a course they previously failed) and is
    // never excluded on academic-history grounds, but still respects seats/clash.
    if (retakeRequired && reason === "Already passed") {
      eligible = true;
      reason = null;
    }

    return {
      offeringId: off._id,
      courseCode: off.courseId.code,
      courseTitle: off.courseId.title,
      credits: off.courseId.credits,
      section: off.section,
      day: off.day,
      startTime: off.startTime,
      endTime: off.endTime,
      room: off.room,
      instructor: off.instructor,
      seatsRemaining,
      addDropOpen: off.addDropOpen,
      eligible,
      retakeRequired,
      reason, // null when eligible
    };
  });

  // Retake-required courses are listed first, per the brief.
  results.sort((a, b) => (b.retakeRequired ? 1 : 0) - (a.retakeRequired ? 1 : 0));

  return results;
}

module.exports = { getEligibleOfferings, timesOverlap, PASSING_GRADES };