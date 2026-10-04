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

  // 3. This student's CURRENT registrations for this term (for clash checking
  //    AND for detecting "already registered"). courseId is populated here too
  const currentRegs = await Registration.find({
    studentId,
    term,
    status: "registered",
  }).populate({ path: "offeringId", populate: { path: "courseId" } });

  const currentOfferings = currentRegs
    .map((r) => r.offeringId)
    .filter(Boolean); // in case an offering was deleted

  const currentOfferingIds = new Set(currentOfferings.map((o) => String(o._id)));

  // Quick lookup: courseId(string) -> whether the student has EVER passed / failed it.
  const passedCourseIds = new Set(
    records.filter((r) => PASSING_GRADES.includes(r.grade)).map((r) => String(r.courseId))
  );
  const failedCourseIds = new Set(
    records.filter((r) => r.grade === "F").map((r) => String(r.courseId))
  );

  // Fix #5: retakeRequired must mean "failed AND never later passed" - a student
  // who failed a course once but passed it on a retake should NOT be flagged as
  // still needing a retake. Comparing failedCourseIds vs passedCourseIds alone
  // isn't enough either (that can't tell WHICH attempt was more recent), so we
  // use the term string to find whichever attempt happened last.
  const trueRetakeRequiredCourseIds = new Set(
    [...failedCourseIds].filter((courseId) => {
      const attempts = records
        .filter((r) => String(r.courseId) === courseId)
        .sort((a, b) => a.term.localeCompare(b.term)); // oldest -> newest term
      const latestAttempt = attempts[attempts.length - 1];
      return latestAttempt.grade === "F"; // only a retake if the MOST RECENT attempt was a fail
    })
  );

  const results = offerings.map((off) => {
    const courseId = String(off.courseId._id);
    const seatsRemaining = off.seats - off.seatsTaken;
    const retakeRequired = trueRetakeRequiredCourseIds.has(courseId); // fix #5

    let eligible = true;
    let reason = null;

    // Rule: Not already passed - SKIPPED ENTIRELY if a retake is genuinely required,
    // so a retake-required course never gets excluded as "already passed" in the
    // first place (fix #5 - no more relying on a brittle string-match override).
    if (!retakeRequired && passedCourseIds.has(courseId)) {
      const pastGrade = records.find(
        (r) => String(r.courseId) === courseId && PASSING_GRADES.includes(r.grade)
      )?.grade;
      eligible = false;
      reason = `Already passed — grade ${pastGrade}`;
    }

    // Rule (fix #7): already registered for THIS exact section this term.
    // Checked early so it takes priority over seats/clash messaging, since
    // re-registering for something you already have isn't really a capacity
    // or scheduling problem - it's just redundant.
    if (eligible && currentOfferingIds.has(String(off._id))) {
      eligible = false;
      reason = "Already registered";
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
        // fix #6: courseId is now populated on currentOfferings, so we can show
        // the course code exactly as the brief's example does: "Clashes with
        // CSC220 Section 2", not just a bare section number.
        const clashCode = clash.courseId?.code || "another course";
        reason = `Clashes with ${clashCode} Section ${clash.section} (${clash.day} ${clash.startTime}-${clash.endTime})`;
      }
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