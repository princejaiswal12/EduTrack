const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  class: String,
  subject: String,
  examType: String
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);