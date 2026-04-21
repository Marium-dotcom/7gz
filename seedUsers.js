import mongoose from "mongoose";
import User from "./libs/models/user.ts";

const MONGO_URI = "mongodb+srv://appo:appo2026@cluster0.3t84ome.mongodb.net/?appName=Cluster0"

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo connected");

    await User.insertMany([
      { name: "Ahmed Nabil", email: "ahmed.nabil@gmail.com", role: "admin" },
      { name: "Sara Khaled", email: "sara.khaled@gmail.com", role: "user" }
    ]);

    console.log("Users inserted");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();