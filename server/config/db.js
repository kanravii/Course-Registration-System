const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the connection string in .env
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // stop the server if the DB is unreachable
  }
}

module.exports = connectDB;