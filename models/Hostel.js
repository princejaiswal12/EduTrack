const mongoose = require("mongoose");
const hostelSchema = new mongoose.Schema({
  hostelName: String,
  hostelType: String,
  capacity: Number,
  wardenName: String,
  fees: Number
});
module.exports = mongoose.model("Hostel", hostelSchema);

