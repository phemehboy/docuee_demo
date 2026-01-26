import mongoose from "mongoose";

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "❌ MONGODB_URI is missing. Did you set it in Render env vars?"
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "docuee",
        bufferCommands: false,
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
};
