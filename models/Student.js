const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  fullName: String,
  rollNumber: String,
  email: String,
  phone: String,
  class: String,
  hostel: String,
  photo: {
    data: Buffer,
    contentType: String
  }
});
module.exports = mongoose.model("Student", studentSchema);
