import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed");

    console.error(error);

    process.exit(1);
  }
};