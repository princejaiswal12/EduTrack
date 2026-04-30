const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  teacher: String,
  description: String,
  dueDate: Date,

  file: {
    data: Buffer,
    contentType: String
  },

  // ✅ FIXED VERSION
  submissions: [
    {
      studentName: String,

      file: {
        data: Buffer,
        contentType: String
      },

      submittedAt: {
        type: Date,
        default: Date.now
      },

      marks: Number,
      feedback: String
    }
  ]
});

module.exports = mongoose.model("Assignment", assignmentSchema);