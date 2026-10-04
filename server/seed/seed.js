//this is just a temporary seed for testing
//the dataset will change after the database manager puts his dataset into work
//i added some notes for what things we need to add more so that we can adjust it later on

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/User");
const Course = require("../models/Course");
const Offering = require("../models/Offering");
const Registration = require("../models/Registration");
const Record = require("../models/Record");

const TERM = "2026-1";

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Offering.deleteMany({}),
    Registration.deleteMany({}),
    Record.deleteMany({}),
  ]);

  // ---- 1. Users: 1 admin, 2 advisors, 5 starter students (expand to 25) ----
  const pwHash = await bcrypt.hash("password123", 10); // same test password for every seeded account

  const admin = await User.create({
    name: "Alex Admin",
    email: "admin@university.edu",
    passwordHash: pwHash,
    role: "admin",
  });

  const [advisor1, advisor2] = await User.insertMany([
    { name: "Dr. Priya Advisor", email: "advisor1@university.edu", passwordHash: pwHash, role: "advisor" },
    { name: "Dr. Somchai Advisor", email: "advisor2@university.edu", passwordHash: pwHash, role: "advisor" },
  ]);

  // Invented names + invented IDs only, per Section 8.2 (PDPA anonymisation).
  const studentSeed = [
    { name: "Nina Torres", studentId: "S001" },
    { name: "Ken Watanabe-Lee", studentId: "S002" },
    { name: "Mei Chalermchai", studentId: "S003" },
    { name: "Oskar Lindgren", studentId: "S004" },
    { name: "Farah Haidari", studentId: "S005" },
    // ... Data lead: add 20 more to reach the required 25 ...
  ];

  const students = await User.insertMany(
    studentSeed.map((s) => ({
      name: s.name,
      email: `${s.studentId.toLowerCase()}@student.university.edu`,
      passwordHash: pwHash,
      role: "student",
      studentId: s.studentId,
      advisorId: advisor1._id,
    }))
  );

  // ---- 2. Courses (catalog) ----
  const courses = await Course.insertMany([
    { code: "CSC101", title: "Introduction to Programming", credits: 3 },
    { code: "CSC201", title: "Data Structures", credits: 3 },
    { code: "CSC220", title: "Web Development II", credits: 3 },
    { code: "CSC230", title: "Database Systems", credits: 3 },
    { code: "CSC310", title: "Operating Systems", credits: 3 },
    { code: "MTH101", title: "Calculus I", credits: 3 },
    // Data lead: expand to ~18 courses per Section 8.
  ]);
  const byCode = Object.fromEntries(courses.map((c) => [c.code, c]));

  // ---- 3. Offerings for the current term ----
  const offerings = await Offering.insertMany([
    { courseId: byCode.CSC220._id, term: TERM, section: 1, day: "Mon", startTime: "09:00", endTime: "10:30", room: "IT-301", instructor: "Dr. Priya Advisor", seats: 30, seatsTaken: 0 },
    { courseId: byCode.CSC220._id, term: TERM, section: 2, day: "Wed", startTime: "13:00", endTime: "14:30", room: "IT-302", instructor: "Dr. Somchai Advisor", seats: 2, seatsTaken: 2 }, // full, to demo the "Full" rule
    { courseId: byCode.CSC230._id, term: TERM, section: 1, day: "Mon", startTime: "09:30", endTime: "11:00", room: "IT-201", instructor: "Dr. Priya Advisor", seats: 25, seatsTaken: 0 }, // overlaps CSC220-1, to demo the clash rule
    { courseId: byCode.CSC310._id, term: TERM, section: 1, day: "Tue", startTime: "10:00", endTime: "11:30", room: "IT-303", instructor: "Dr. Somchai Advisor", seats: 20, seatsTaken: 0 },
    { courseId: byCode.CSC101._id, term: TERM, section: 1, day: "Thu", startTime: "09:00", endTime: "10:30", room: "IT-101", instructor: "Dr. Priya Advisor", seats: 30, seatsTaken: 0, addDropOpen: true },
    { courseId: byCode.MTH101._id, term: TERM, section: 1, day: "Fri", startTime: "09:00", endTime: "10:30", room: "SCI-101", instructor: "Dr. Somchai Advisor", seats: 30, seatsTaken: 0 },
  ]);

  // ---- 4. Past-term completed-course records ----
  // Nina already passed CSC101 -> should be excluded from her eligible list.
  await Record.create({ studentId: students[0]._id, courseId: byCode.CSC101._id, term: "2025-2", grade: "B+" });

  // Ken failed CSC101 -> must show "Retake required" and appear first.
  await Record.create({ studentId: students[1]._id, courseId: byCode.CSC101._id, term: "2025-2", grade: "F" });

  // Mei withdrew from MTH101 -> may be taken again, no exclusion.
  await Record.create({ studentId: students[2]._id, courseId: byCode.MTH101._id, term: "2025-2", grade: "W" });

  console.log(`${students.length} students, 2 advisors, 1 admin created`);
  console.log(`${courses.length} courses, ${offerings.length} sections created for term ${TERM}`);
  console.log(`3 completed-course records created`);
  console.log("\nTest logins (all use password: password123):");
  console.log(`  Admin:   ${admin.email}`);
  console.log(`  Advisor: ${advisor1.email}`);
  console.log(`  Student: ${students[0].email} (already passed CSC101)`);
  console.log(`  Student: ${students[1].email} (failed CSC101 - retake required)`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});