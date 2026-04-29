const mongoose = require("mongoose");
const teacherSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  subject: String,
  department: String,
  photo: {
    data: Buffer,
    contentType: String
  }
});
module.exports = mongoose.model("Teacher", teacherSchema);
