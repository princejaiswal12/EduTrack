const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  subjectName: String,
  subjectCode: String,
  department: String,
  assignedTeacher: String
});
module.exports = mongoose.model("Subject", subjectSchema);
