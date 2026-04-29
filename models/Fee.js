const mongoose = require("mongoose");
const feeSchema = new mongoose.Schema({
  studentName: String,
  class: String,
  amount: Number,
  dueDate: Date,
  status: String
});
module.exports = mongoose.model("Fee", feeSchema);
