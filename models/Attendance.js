const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentName: String,
  subject: String,
  date: {
    type: Date,
    default: Date.now
  },
  status: String, // Present / Absent
  teacher: String
});

module.exports = mongoose.model("Attendance", attendanceSchema);