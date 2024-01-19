const mongoose = require("mongoose");

const URL =
  "mongodb+srv://ahmadkamran710788:h71lLNpMHmxQxaHM@cluster0.ieeoda4.mongodb.net/?retryWrites=true&w=majority"; // Your MongoDB URL here
const db = mongoose
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

module.exports = { db };
