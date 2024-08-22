const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fs = require("fs");
const tourController = require("./controllers/tourController");

const app = express();
const connectDB = require("./config/db");

app.use(morgan("dev"));

app.use(express.json());

//? Load environment variables from the config file
dotenv.config({ path: "./config/config.env" });

//?route files
const tours = require("./routes/tourRoute");

//?Mount routes
app.use("/api/v1/tours", tours);

connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`.bgMagenta);
});
