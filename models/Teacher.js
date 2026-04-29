const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  subject: String,
  department: String,

  photo: {
    data: Buffer,
    contentType: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);