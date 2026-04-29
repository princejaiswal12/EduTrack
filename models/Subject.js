const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true, unique: true },
  department: String,
  assignedTeacher: String
}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);