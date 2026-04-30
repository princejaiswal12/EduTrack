const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentName: String,
  subject: String,
  marks: Number,
  teacher: String,
  examType: String, // Mid, Final etc
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Marks", marksSchema);