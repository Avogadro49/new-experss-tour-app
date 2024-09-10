const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const colors = require("colors");
const Tour = require("../model/TourModel");

dotenv.config({ path: path.join(__dirname, "config.env") });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.bgGreen);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

//read json file
//prettier-ignore
const tours = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tours.json'), 'utf-8'));

//IMPORTING data to db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data successfully imported".bgGreen);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

//DELETING data to db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("data successfully deleted".bgRed);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === "--import" || process.argv[2] === "--delete") {
  connectDB().then(() => {
    if (process.argv[2] === "--import") {
      importData();
    } else if (process.argv[2] === "--delete") {
      deleteData();
    }
  });
}
module.exports = connectDB;
