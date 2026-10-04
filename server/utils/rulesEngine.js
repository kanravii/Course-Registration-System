const Record = require("../models/Record");
const Registration = require("../models/Registration");
const Offering = require("../models/Offering");

const PASSING_GRADES = ["A", "B+", "B", "C+", "C", "D+", "D"];

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// A single meeting slot overlaps another if they share a day AND their times overlap.
function slotsOverlap(a, b) {
  if (a.day !== b.day) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

// An offering can meet multiple times a week (schedule is an ARRAY), so two
// offerings clash if ANY slot in one overlaps ANY slot in the other.
function offeringsOverlap(offA, offB) {
  for (const slotA of offA.schedule || []) {
    for (const slotB of offB.schedule || []) {
      if (slotsOverlap(slotA, slotB)) return true;
    }
  }
  return false;
}

// Formats an offering's schedule for a human-readable clash message,
// e.g. "Mon 09:00-10:00, Wed 09:00-10:00".
function formatSchedule(schedule) {
  return (schedule || []).map((s) => `${s.day} ${s.startTime}-${s.endTime}`).join(", ");
}

/**
 * Builds the eligible/excluded course list for one student in one term.
 * Applies: offered this term, not already passed, retake-required courses
 * retakeable, prerequisites met, seats available, no time clash, not
 * already registered for this exact section.
 *
 * @param {ObjectId} studentId
 * @param {String} term
 */
async function getEligibleOfferings(studentId, term) {
  const offerings = await Offering.find({ term })
    .populate("course")
    .populate("instructor", "name email")
    .lean();
  const records = await Record.find({ student: studentId }).lean();

  const currentRegs = await Registration.find({
    student: studentId,
    status: { $in: ["requested", "registered"] },
  }).populate({ path: "offering", match: { term }, populate: { path: "course" } });

  const currentOfferings = currentRegs.map((r) => r.offering).filter(Boolean);
  const currentOfferingIds = new Set(currentOfferings.map((o) => String(o._id)));

  const passedCourseIds = new Set(
    records.filter((r) => PASSING_GRADES.includes(r.grade)).map((r) => String(r.course))
  );
  const failedCourseIds = new Set(
    records.filter((r) => r.grade === "F").map((r) => String(r.course))
  );

  // Retake required = the MOST RECENT attempt (by term string) was an F.
  // A student who failed once but later passed should NOT be flagged.
  const trueRetakeRequiredCourseIds = new Set(
    [...failedCourseIds].filter((courseId) => {
      const attempts = records
        .filter((r) => String(r.course) === courseId)
        .sort((a, b) => a.term.localeCompare(b.term));
      const latestAttempt = attempts[attempts.length - 1];
      return latestAttempt.grade === "F";
    })
  );

  const results = offerings.map((off) => {
    const courseId = String(off.course._id);
    const seatsRemaining = off.capacity - off.enrolledCount;
    const retakeRequired = trueRetakeRequiredCourseIds.has(courseId);

    let eligible = true;
    let reason = null;

    // Rule: offering must actually be open for registration.
    if (off.status !== "open") {
      eligible = false;
      reason = `Not open for registration (${off.status})`;
    }

    // Rule: prerequisites must be satisfied, UNLESS a retake is required
    // (retaking a failed course never needs its own prereqs re-checked).
    if (eligible && !retakeRequired && off.course.prerequisites?.length) {
      const missing = off.course.prerequisites.filter(
        (prereqId) => !passedCourseIds.has(String(prereqId))
      );
      if (missing.length) {
        eligible = false;
        reason = "Missing prerequisite(s)";
      }
    }

    // Rule: not already passed - skipped entirely when a retake is required.
    if (eligible && !retakeRequired && passedCourseIds.has(courseId)) {
      const pastGrade = records.find(
        (r) => String(r.course) === courseId && PASSING_GRADES.includes(r.grade)
      )?.grade;
      eligible = false;
      reason = `Already passed — grade ${pastGrade}`;
    }

    // Rule: already registered/requested for this exact section this term.
    if (eligible && currentOfferingIds.has(String(off._id))) {
      eligible = false;
      reason = "Already registered";
    }

    // Rule: seats available.
    if (eligible && seatsRemaining <= 0) {
      eligible = false;
      reason = "Full — 0 seats remaining";
    }

    // Rule: no time clash with a section already selected this term.
    if (eligible) {
      const clash = currentOfferings.find(
        (co) => String(co._id) !== String(off._id) && offeringsOverlap(off, co)
      );
      if (clash) {
        eligible = false;
        const clashCode = clash.course?.code || "another course";
        reason = `Clashes with ${clashCode} Section ${clash.section} (${formatSchedule(clash.schedule)})`;
      }
    }

    return {
      offeringId: off._id,
      courseCode: off.course.code,
      courseTitle: off.course.title,
      credits: off.course.credits,
      section: off.section,
      schedule: off.schedule,
      instructor: off.instructor,
      seatsRemaining,
      status: off.status,
      eligible,
      retakeRequired,
      reason,
    };
  });

  results.sort((a, b) => (b.retakeRequired ? 1 : 0) - (a.retakeRequired ? 1 : 0));

  return results;
}

module.exports = { getEligibleOfferings, offeringsOverlap, PASSING_GRADES };