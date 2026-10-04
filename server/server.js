require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const offeringRoutes = require("./routes/offeringRoutes");
const studentRoutes = require("./routes/studentRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const meRoutes = require("./routes/meRoutes");

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // lets the React dev server call this API
app.use(express.json()); // parse JSON request bodies
app.use(morgan("dev")); // request logging in the terminal - handy while developing

// Serve the Add/Drop form file. Put add_drop_form.pdf (or .docx) in server/public/.
app.use("/files", express.static("public"));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offerings", offeringRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/me", meRoutes);

// Simple health check - useful for confirming the API is up
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 404 for anything else under /api
app.use("/api", (req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler - must be registered LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});