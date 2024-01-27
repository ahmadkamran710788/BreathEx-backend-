const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const PORT = process.env.PORT || 9000;
const app = express();
const URL =
  "mongodb+srv://ahmadkamran710788:h71lLNpMHmxQxaHM@cluster0.ieeoda4.mongodb.net/?retryWrites=true&w=majority"; // Your MongoDB URL here
const cookie = require("cookie-parser");

// Import routes
const authRouter = require("./routes/auth");
const adminauthRouter = require("./routes/admin_auth");
const doctorauthRouter = require("./routes/doctor_auth");

// Middleware
app.use(express.json());
app.use("/BreathEx", authRouter);
app.use("/BreathEx/admin", adminauthRouter);
app.use("/BreathEx/doctor", doctorauthRouter);

// Connect to MongoDB
mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connection Successful");
    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Connected at port ${PORT}`);
    });
  })
  .catch((e) => {
    console.log(e);
  });
