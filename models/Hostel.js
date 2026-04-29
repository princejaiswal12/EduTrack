const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  hostelName: { type: String, required: true },
  hostelType: String,
  capacity: Number,
  wardenName: String,
  fees: Number
}, { timestamps: true });

module.exports = mongoose.model("Hostel", hostelSchema);