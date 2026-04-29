require("dotenv").config(); // ✅ MUST BE FIRST LINE

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const multer = require("multer");
const path = require("path");

const Admin = require("./models/Admin");
const Teacher = require("./models/Teacher");
const Student = require("./models/Student");
const Subject = require("./models/Subject");
const Fee = require("./models/Fee");
const Hostel = require("./models/Hostel");
const Timetable = require("./models/Timetable");
const Exam = require("./models/Exam");

const app = express();

// === Config ===
const PORT = process.env.PORT || 5000;

// ✅ Use Atlas from .env
const MONGO = process.env.MONGO_URI;

// 🔍 Debug (remove later)
console.log("MONGO URI:", MONGO);

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to DB"))
.catch(err => console.error("❌ DB error:", err));

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/public", express.static(path.join(__dirname, "public")));

// multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------------- ROUTES -----------------------

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
  try {
    const { role, name, email } = req.body;
    if (!role || !name || !email) return res.status(400).send("Missing fields");

    if (role === "admin") {
      const admin = await Admin.findOne({ name, email });
      if (!admin) return res.status(401).send("Admin not found");
      return res.redirect("/admin/dashboard");
    }

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ fullName: name, email });
      if (!teacher) return res.status(401).send("Teacher not found");
      return res.redirect(`/teachers/${teacher._id}/dashboard`);
    }

    if (role === "student") {
      const student = await Student.findOne({ fullName: name, email });
      if (!student) return res.status(401).send("Student not found");
      return res.redirect(`/students/${student._id}/dashboard`);
    }

    res.status(400).send("Invalid role");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ---------------- Admin Dashboard ----------------
app.get("/admin/dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalFees = await Fee.countDocuments();
    const totalHostel = await Hostel.countDocuments();
    const totalTimetables = await Timetable.countDocuments();

    res.render("adminDashboard", {
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalExams,
      totalFees,
      totalHostel,
      totalTimetables
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ---------------- Students ----------------
app.get("/students", async (req, res) => {
  const students = await Student.find().lean();
  res.render("manage-students", { students });
});

app.post("/students", upload.single("studentPhoto"), async (req, res) => {
  try {
    const { student } = req.body;
    const newStudent = new Student({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      email: student.email,
      phone: student.phone,
      class: student.class,
      hostel: student.hostel
    });

    if (req.file) {
      newStudent.photo.data = req.file.buffer;
      newStudent.photo.contentType = req.file.mimetype;
    }

    await newStudent.save();
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving student");
  }
});

app.get("/students/:id/dashboard", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).send("Student not found");

    let photoBase64 = "";
    if (student.photo && student.photo.data) {
      photoBase64 = `data:${student.photo.contentType};base64,${student.photo.data.toString("base64")}`;
    }

    res.render("studentDashboard", { student, photoBase64 });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ---------------- Teachers ----------------
app.get("/teachers", async (req, res) => {
  const teachers = await Teacher.find().lean();
  res.render("manage-teachers", { teachers });
});

app.post("/teachers", upload.single("teacherPhoto"), async (req, res) => {
  try {
    const { teacher } = req.body;
    const newTeacher = new Teacher({
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      department: teacher.department
    });

    if (req.file) {
      newTeacher.photo.data = req.file.buffer;
      newTeacher.photo.contentType = req.file.mimetype;
    }

    await newTeacher.save();
    res.redirect(`/teachers/${newTeacher._id}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving teacher");
  }
});

app.get("/teachers/:id/dashboard", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).lean();
    if (!teacher) return res.status(404).send("Teacher not found");

    let photoBase64 = "";
    if (teacher.photo && teacher.photo.data) {
      photoBase64 = `data:${teacher.photo.contentType};base64,${teacher.photo.data.toString("base64")}`;
    }

    const assignedSubjects = await Subject.find({ assignedTeacher: teacher.fullName }).lean();
    const timetable = await Timetable.find({ teacher: teacher.fullName }).lean();

    res.render("teacherDashboard", { teacher, photoBase64, assignedSubjects, timetable });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ---------------- Misc ----------------
app.use((req, res) => res.status(404).send("Not found"));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));