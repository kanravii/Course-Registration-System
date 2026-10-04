require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const Offering = require("./models/Offering");
const Registration = require("./models/Registration");
const Record = require("./models/Record");

const demoPassword = "ChangeMe123!";
const term = "2026-FALL";
const registrationOpensAt = new Date("2026-08-01T00:00:00.000Z");
const registrationClosesAt = new Date("2026-12-01T23:59:59.000Z");

async function upsertUser(user, passwordHash) {
  return User.findOneAndUpdate(
    { email: user.email },
    { $set: { ...user, passwordHash } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function upsertCourse(course) {
  return Course.findOneAndUpdate(
    { code: course.code },
    { $set: course },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function upsertOffering(offering) {
  return Offering.findOneAndUpdate(
    { course: offering.course, term: offering.term, section: offering.section },
    { $set: offering },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function upsertRegistration(registration) {
  return Registration.findOneAndUpdate(
    { student: registration.student, offering: registration.offering },
    { $set: registration },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function upsertRecord(record) {
  return Record.findOneAndUpdate(
    { student: record.student, course: record.course, attempt: record.attempt },
    { $set: record },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const [admin, advisor, alice, bob] = await Promise.all([
    upsertUser({
      employeeId: "EMP0001",
      name: "System Administrator",
      email: "admin@example.com",
      role: "admin",
    }, passwordHash),
    upsertUser({
      employeeId: "EMP0101",
      name: "Dr. Ada Advisor",
      email: "advisor@example.com",
      role: "advisor",
    }, passwordHash),
    upsertUser({
      studentId: "STU0001",
      name: "Alice Student",
      email: "alice@example.com",
      role: "student",
      program: "Computer Science",
      yearLevel: 2,
    }, passwordHash),
    upsertUser({
      studentId: "STU0002",
      name: "Bob Student",
      email: "bob@example.com",
      role: "student",
      program: "Computer Science",
      yearLevel: 1,
    }, passwordHash),
  ]);

  const programming = await upsertCourse({
    code: "CSC101",
    title: "Introduction to Programming",
    description: "Programming fundamentals and problem solving.",
    credits: 3,
  });
  const database = await upsertCourse({
    code: "CSC220",
    title: "Database Systems",
    description: "Relational data modeling, SQL, and database design.",
    credits: 3,
    prerequisites: [programming._id],
  });
  const web = await upsertCourse({
    code: "CSC301",
    title: "Web Application Development",
    description: "Design and implementation of full-stack web applications.",
    credits: 3,
    prerequisites: [programming._id],
  });

  const databaseOffering = await upsertOffering({
    course: database._id,
    term,
    section: "A",
    instructor: advisor._id,
    capacity: 30,
    enrolledCount: 2,
    schedule: [
      { day: "Tue", startTime: "09:00", endTime: "10:30", room: "B201" },
      { day: "Thu", startTime: "09:00", endTime: "10:30", room: "B201" },
    ],
    registrationOpensAt,
    registrationClosesAt,
    status: "open",
  });
  const webOffering = await upsertOffering({
    course: web._id,
    term,
    section: "A",
    instructor: advisor._id,
    capacity: 25,
    enrolledCount: 1,
    schedule: [{ day: "Mon", startTime: "13:00", endTime: "15:00", room: "C105" }],
    registrationOpensAt,
    registrationClosesAt,
    status: "open",
  });

  await Promise.all([
    upsertRecord({ student: alice._id, course: programming._id, term: "2026-SPRING", attempt: 1, grade: "A", credits: programming.credits }),
    upsertRecord({ student: bob._id, course: programming._id, term: "2026-SPRING", attempt: 1, grade: "B", credits: programming.credits }),
    upsertRegistration({ student: alice._id, offering: databaseOffering._id, status: "registered", registeredAt: new Date() }),
    upsertRegistration({ student: bob._id, offering: databaseOffering._id, status: "registered", registeredAt: new Date() }),
    upsertRegistration({ student: alice._id, offering: webOffering._id, status: "requested" }),
  ]);

  console.log("Seed completed for database:", mongoose.connection.name);
  console.log("Demo login accounts use password:", demoPassword);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});