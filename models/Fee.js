const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  class: String,
  amount: Number,
  dueDate: Date,
  status: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);