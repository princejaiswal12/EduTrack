const mongoose = require("mongoose");
const ttSchema = new mongoose.Schema({
  class: String,
  subject: String,
  teacher: String,
  day: String,
  time: String
});
module.exports = mongoose.model("Timetable", ttSchema);
