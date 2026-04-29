const mongoose = require("mongoose");
const examSchema = new mongoose.Schema({
  examName: String,
  examDate: Date,
  class: String,
  subject: String,
  examType: String
});
module.exports = mongoose.model("Exam", examSchema);
