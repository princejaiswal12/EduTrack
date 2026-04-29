const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  class: String,
  hostel: String,

  photo: {
    data: Buffer,
    contentType: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);