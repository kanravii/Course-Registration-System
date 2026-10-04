const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); 

const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the connection string in .env
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // stop the server if the DB is unreachable
  }
}

module.exports = connectDB;
