const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  class: String,
  subject: String,
  teacher: String,
  day: String,
  time: String
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);