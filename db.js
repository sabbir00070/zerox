import mongoose from "mongoose";

async function connectDB() {
  try {
    const uri = process.env.MONGO_DB;
    await mongoose.connect(uri, { dbName: "zerox" });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

export default connectDB;