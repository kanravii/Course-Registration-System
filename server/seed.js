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
const instructors = [
  "Dr. Nay Myo Sandar",
  "Dr. Lanka",
  "Ajarn. Thinzar Aung Win",
  "Ajarn. Susanta Malakar",
  "Ajarn. Zakariyya Bature",
  "Ajarn. Atikom",
];
const terms = [
  { name: "1/2026", opens: "2026-03-01", closes: "2026-06-15" },
  { name: "2/2026", opens: "2026-07-01", closes: "2026-10-15" },
  { name: "3/2026", opens: "2026-11-01", closes: "2027-02-15" },
];
const studentNames = [
  "Aung Kyaw Min", "Aye Chan Moe", "Chit Thu Wai", "Daw Hnin Ei", "Ei Phyu Zin",
  "Htet Aung Lin", "Hsu Myat Noe", "Kaung Htet Zaw", "Khin Thazin Win", "Kyaw Zin Htet",
  "Moe Myint Thu", "Mya Thiri Aung", "Nay Lin Oo", "Nwe Ni Soe", "Phyo Pyae Sone",
  "Pyae Phyo Kyaw", "Sandi Hlaing", "Shwe Sin Win", "Su Myat Mon", "Thawda Aung",
  "Thet Htar Oo", "Thiri Tun", "Wai Yan Htun", "Yamin Htet", "Zaw Min Oo",
];

function course(code, title, programs, yearLevel, category, prerequisites = [], specialization) {
  return { code, title, programs, yearLevel, category, prerequisites, specialization, credits: 4 };
}

const curriculum = [
  course("BSC101", "Introduction to Computing and Intelligent Systems", ["CS"], 1, "basic-core"),
  course("BSC102", "Discrete Mathematics Structures", ["CS"], 1, "basic-core"),
  course("BSC103", "Introduction to Data Structures and Algorithms Analysis", ["CS"], 1, "basic-core"),
  course("BSC104", "Computer Organization", ["CS"], 1, "basic-core"),
  course("BSC120", "Web Development I", ["CS"], 2, "basic-core", ["BSC254", "CSC221"]),
  course("BSC210", "Ethics and Professional Issues in Computing and Intelligence Systems", ["CS"], 1, "basic-core"),
  course("BSC224", "Introduction to Data Science", ["CS"], 2, "basic-core", ["BSC102"]),
  course("BSC254", "Human Computer Interaction", ["CS"], 2, "basic-core"),
  course("BSC321", "System Analysis, Design, and Implementation", ["CS"], 1, "basic-core"),
  course("BSC479", "Software Planning and Project Management", ["CS"], 3, "basic-core"),
  course("CSC233", "Introduction to Internet of Things", ["CS"], 1, "major-requirement", ["CSC221"]),
  course("CSC441", "Data Management", ["CS"], 1, "major-requirement"),
  course("CSC221", "Java Programming I", ["CS"], 1, "major-requirement", ["BSC103"]),
  course("CSC331", "Computer Networks", ["CS"], 1, "major-requirement"),
  course("CSC240", "Operating Systems and Maintenance", ["CS"], 1, "major-requirement"),
  course("CSC231", "System Programming", ["CS"], 1, "major-requirement"),
  course("CSC442", "Databases", ["CS"], 2, "major-requirement", ["CSC441"]),
  course("CSC222", "Java Programming II", ["CS"], 2, "major-requirement", ["CSC221"]),
  course("CSC475", "Network I", ["CS"], 2, "major-requirement"),
  course("CSC420", "Data Communication Technologies", ["CS"], 3, "major-requirement", ["CSC475"]),
  course("CSC220", "Web Development II", ["CS"], 3, "major-elective", ["CSC222"], "Software Engineering"),
  course("CSC367", "Software Architecture and Modelling", ["CS"], 3, "major-elective", ["BSC321"], "Software Engineering"),
  course("CSC343", "Mobile Application Development", ["CS"], 3, "major-elective", ["CSC222"], "Software Engineering"),
  course("CSC368", "Software Testing and Maintenance", ["CS"], 3, "major-elective", ["CSC222"], "Software Engineering"),
  course("CSC365", "Software Quality Assurance Principles", ["CS"], 3, "major-elective", ["BSC479"], "Software Engineering"),
  course("CSC369", "Software Program Capstone Project", ["CS"], 3, "major-elective", [], "Software Engineering"),
  course("CSC201", "Computer Service Desk and Incident Management", ["CS"], 2, "major-elective", [], "Cyber Security"),
  course("CSC476", "Network II", ["CS"], 2, "major-elective", ["CSC475"], "Cyber Security"),
  course("CSC421", "Security in Computing and Information Technology", ["CS"], 2, "major-elective", [], "Cyber Security"),
  course("CSC453", "Computer and Internet Forensics", ["CS"], 2, "major-elective", [], "Cyber Security"),
  course("CSC451", "Cloud Foundations", ["CS"], 2, "major-elective", [], "Cyber Security"),
  course("CSC452", "Blockchain Technology Practices", ["CS"], 2, "major-elective", ["CSC475"], "Cyber Security"),
  course("CSC351", "Programming for Data Science", ["CS"], 2, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("CSC352", "Artificial Intelligence", ["CS"], 3, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("CSC353", "Machine Learning Foundation", ["CS"], 2, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("CSC356", "AI Ethics and Responsible AI", ["CS"], 3, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("CSC357", "AI Capstone Project", ["CS"], 2, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("CSC354", "AI in Business and Decision Modeling", ["CS"], 3, "major-elective", ["BSC224"], "Artificial Intelligence"),
  course("ITE101", "Information Technology Fundamentals", ["IT"], 1, "basic-core"),
  course("ITE102", "Discrete Mathematics Structure", ["IT"], 1, "basic-core"),
  course("ITE103", "Introduction to Data Structure and Algorithms Analysis", ["IT"], 3, "basic-core"),
  course("ITE104", "Computer Organization", ["IT"], 3, "basic-core"),
  course("ITE210", "Social and Professional Issues in Information Technology", ["IT"], 1, "major-requirement"),
  course("ITE479", "IT Planning and Project Management", ["IT"], 3, "major-requirement"),
  course("ITE321", "System Analysis, Design, and Implementation", ["IT"], 1, "major-requirement"),
  course("ITE331", "Introduction to 3D Modeling and Virtual Reality", ["IT"], 3, "major-requirement"),
  course("ITE120", "Web Development I", ["IT"], 2, "major-requirement", ["ITE254", "ITE221"]),
  course("ITE441", "Database Management Systems I", ["IT"], 2, "major-requirement"),
  course("ITE224", "Introduction to Data Science", ["IT"], 2, "major-requirement", ["ITE102"]),
  course("ITE442", "Database Management Systems II", ["IT"], 2, "major-requirement", ["ITE441"]),
  course("ITE233", "Introduction to Internet of Things", ["IT"], 3, "major-requirement", ["ITE221"]),
  course("ITE222", "Programming II", ["IT"], 2, "major-requirement", ["ITE221"]),
  course("ITE221", "Programming I", ["IT"], 1, "major-requirement", ["ITE103"]),
  course("ITE254", "Human Computer Interaction", ["IT"], 2, "major-requirement"),
  course("ITE231", "System Administration and Maintenance", ["IT"], 3, "major-requirement"),
  course("ITE420", "Information Assurance and Security I", ["IT"], 2, "major-requirement", ["ITE475"]),
  course("ITE240", "Operating Systems", ["IT"], 2, "major-requirement"),
  course("ITE475", "Network I", ["IT"], 2, "major-requirement"),
  course("ITE220", "Web Development II", ["IT"], 3, "major-elective", ["ITE222"], "Software Engineering"),
  course("ITE367", "Software Architecture and Modelling", ["IT"], 3, "major-elective", ["ITE321"], "Software Engineering"),
  course("ITE343", "Mobile Application Development", ["IT"], 3, "major-elective", ["ITE222"], "Software Engineering"),
  course("ITE368", "Software Testing and Maintenance", ["IT"], 3, "major-elective", ["ITE222"], "Software Engineering"),
  course("ITE365", "Software Quality Management", ["IT"], 3, "major-elective", [], "Software Engineering"),
  course("MKT213", "Principles of Marketing", ["IT"], 3, "major-elective", [], "E-Commerce Technology"),
  course("MKT345", "Gamification", ["IT"], 3, "major-elective", [], "E-Commerce Technology"),
  course("MKT333", "Digital Marketing", ["IT"], 3, "major-elective", [], "E-Commerce Technology"),
  course("ITE362", "Digital Advertising Technology", ["IT"], 3, "major-elective", [], "E-Commerce Technology"),
  course("ITE340", "E-Commerce Systems and Infrastructure", ["IT"], 3, "major-elective", ["ITE220"], "E-Commerce Technology"),
  course("ITE351", "Programming for Data Science", ["IT"], 3, "major-elective", ["ITE224"], "Data Science"),
  course("ITE354", "Business Intelligence and Decision Modeling", ["IT"], 3, "major-elective", ["ITE224"], "Data Science"),
  course("ITE352", "Artificial Intelligence and Machine Learning", ["IT"], 3, "major-elective", ["ITE224"], "Data Science"),
  course("ITE355", "Data Warehousing and Data Mining", ["IT"], 3, "major-elective", ["ITE224"], "Data Science"),
  course("ITE353", "Machine Learning Foundation", ["IT"], 3, "major-elective", ["ITE224"], "Data Science"),
  course("ITE201", "IT Service Desk and Incident Management", ["IT"], 3, "major-elective", [], "Network and Security"),
  course("ITE476", "Network II", ["IT"], 3, "major-elective", ["ITE475"], "Network and Security"),
  course("ITE421", "Information Assurance and Security II", ["IT"], 3, "major-elective", ["ITE420"], "Network and Security"),
  course("ITE477", "Window Server", ["IT"], 3, "major-elective", [], "Network and Security"),
  course("ITE451", "AWS Cloud Foundations", ["IT"], 3, "major-elective", [], "Network and Security"),
  course("CSC499", "Internship", ["CS"], 3, "internship"),
  course("ITE499", "Internship", ["IT"], 3, "internship"),
];

async function upsertUser(user, passwordHash) {
  return User.findOneAndUpdate({ email: user.email }, { $set: { ...user, passwordHash } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
}

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const admin = await upsertUser({ employeeId: "EMP0001", name: "System Administrator", email: "admin@example.com", role: "admin" }, passwordHash);
  const advisor = await upsertUser({ employeeId: "EMP0101", name: instructors[0], email: "advisor@example.com", role: "advisor" }, passwordHash);

  const legacyStudents = await User.find({ email: { $in: ["alice@example.com", "bob@example.com"] } }).select("_id");
  const legacyIds = legacyStudents.map((student) => student._id);
  if (legacyIds.length) {
    await Promise.all([Registration.deleteMany({ student: { $in: legacyIds } }), Record.deleteMany({ student: { $in: legacyIds } })]);
    await User.deleteMany({ _id: { $in: legacyIds } });
  }

  const previousSeedStudents = await User.find({
    $or: [{ studentId: /^STU\d{4}$/ }, { email: /^student\d+@example\.com$/ }],
  }).select("_id");
  const previousSeedIds = previousSeedStudents.map((student) => student._id);
  if (previousSeedIds.length) {
    await Promise.all([Registration.deleteMany({ student: { $in: previousSeedIds } }), Record.deleteMany({ student: { $in: previousSeedIds } })]);
    await User.deleteMany({ _id: { $in: previousSeedIds } });
  }

  const legacyOfferings = await Offering.find({ term: "2026-FALL" }).select("_id");
  const legacyOfferingIds = legacyOfferings.map((offering) => offering._id);
  if (legacyOfferingIds.length) {
    await Registration.deleteMany({ offering: { $in: legacyOfferingIds } });
    await Offering.deleteMany({ _id: { $in: legacyOfferingIds } });
  }
  await Course.deleteMany({ code: { $in: ["CSC101", "CSC301"] } });

  const students = await Promise.all(studentNames.map((name, index) => {
    const studentId = `26${String(index + 1).padStart(8, "0")}`;
    return upsertUser({ studentId, name, email: `${studentId}@students.stamford.edu`, role: "student", program: index % 2 ? "IT" : "CS", yearLevel: (index % 3) + 1 }, passwordHash);
  }));

  const courseByCode = new Map();
  for (const item of curriculum) {
    const { prerequisites, ...courseData } = item;
    const model = await Course.findOneAndUpdate({ code: item.code }, { $set: { ...courseData, prerequisites: [], description: `${item.title} in the ${item.programs.join(" and ")} curriculum.` } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
    courseByCode.set(item.code, model);
  }
  for (const item of curriculum) {
    const prerequisites = item.prerequisites.map((code) => courseByCode.get(code)?._id).filter(Boolean);
    await Course.updateOne({ _id: courseByCode.get(item.code)._id }, { $set: { prerequisites } });
  }

  const offerings = [];
  for (let index = 0; index < curriculum.length; index += 1) {
    const item = curriculum[index];
    const term = terms[index % terms.length];
    const courseModel = courseByCode.get(item.code);
    const offering = await Offering.findOneAndUpdate(
      { course: courseModel._id, term: term.name, section: "A" },
      { $set: { course: courseModel._id, term: term.name, section: "A", instructor: advisor._id, capacity: 30, enrolledCount: 0, schedule: [{ day: ["Mon", "Wed", "Fri"][index % 3], startTime: `${9 + (index % 6)}:00`, endTime: `${10 + (index % 6)}:00`, room: `${1 + (index % 2)}${2 + (index % 3)}0${1 + (index % 9)}` }], registrationOpensAt: new Date(term.opens), registrationClosesAt: new Date(term.closes), status: "open" } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    offerings.push(offering);
  }

  await Promise.all(students.map(async (student, index) => {
    const offering = offerings[index % offerings.length];
    const courseModel = courseByCode.get(curriculum[index % curriculum.length].code);
    await Record.findOneAndUpdate({ student: student._id, course: courseModel._id, attempt: 1 }, { $set: { student: student._id, course: courseModel._id, term: "1/2026", attempt: 1, grade: ["A", "B", "A", "C"][index % 4], credits: courseModel.credits } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
    await Registration.findOneAndUpdate({ student: student._id, offering: offering._id }, { $set: { student: student._id, offering: offering._id, status: index % 5 === 0 ? "requested" : "registered", registeredAt: index % 5 === 0 ? undefined : new Date() } }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  }));

  console.log("Seed completed for Stamford International University");
  console.log({ database: mongoose.connection.name, students: students.length, courses: curriculum.length, terms: terms.map((term) => term.name), admin: admin.email, advisor: advisor.email });
  console.log("Demo accounts use password:", demoPassword);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
