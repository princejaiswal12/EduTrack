require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const multer = require("multer");
const path = require("path");

const app = express();

// ================= MODELS =================
const Admin = require("./models/Admin");
const Teacher = require("./models/Teacher");
const Student = require("./models/Student");
const Subject = require("./models/Subject");
const Fee = require("./models/Fee");
const Hostel = require("./models/Hostel");
const Timetable = require("./models/Timetable");
const Exam = require("./models/Exam");

// ================= CONFIG =================
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

// ================= DB CONNECT =================
mongoose.connect(MONGO)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err.message));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= ROUTES =================

// ---------- HOME ----------
app.get("/", (req, res) => {
  res.render("home");
});

// ---------- LOGIN ----------
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { role, name, email } = req.body;

  try {
    if (role === "admin") {
      const admin = await Admin.findOne({ name, email });
      if (!admin) return res.send("Admin not found");
      return res.redirect("/admin/dashboard");
    }

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ fullName: name, email });
      if (!teacher) return res.send("Teacher not found");
      return res.redirect(`/teachers/${teacher._id}/dashboard`);
    }

    if (role === "student") {
      const student = await Student.findOne({ fullName: name, email });
      if (!student) return res.send("Student not found");
      return res.redirect(`/students/${student._id}/dashboard`);
    }

  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

// ---------- REGISTER ----------
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { role, name, email } = req.body;

  try {
    if (role === "admin") {
      await Admin.create({ name, email });
    }

    if (role === "teacher") {
      await Teacher.create({ fullName: name, email });
    }

    if (role === "student") {
      await Student.create({ fullName: name, email });
    }

    res.redirect("/login");

  } catch (err) {
    console.log(err);
    res.send("Register error");
  }
});

// ================= ADMIN DASHBOARD =================
app.get("/admin/dashboard", async (req, res) => {
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
});

// ================= STUDENTS =================
app.get("/students", async (req, res) => {
  const students = await Student.find().lean();
  res.render("manage-students", { students });
});

app.post("/students", upload.single("studentPhoto"), async (req, res) => {
  const { student } = req.body;

  const newStudent = new Student(student);

  if (req.file) {
    newStudent.photo = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  await newStudent.save();
  res.redirect("/students");
});

app.get("/students/:id/dashboard", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  let photoBase64 = "";
  if (student.photo?.data) {
    photoBase64 = `data:${student.photo.contentType};base64,${student.photo.data.toString("base64")}`;
  }

  res.render("studentDashboard", { student, photoBase64 });
});

// ================= TEACHERS =================
app.get("/teachers", async (req, res) => {
  const teachers = await Teacher.find().lean();
  res.render("manage-teachers", { teachers });
});

app.post("/teachers", upload.single("teacherPhoto"), async (req, res) => {
  const { teacher } = req.body;

  const newTeacher = new Teacher(teacher);

  if (req.file) {
    newTeacher.photo = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  await newTeacher.save();
  res.redirect(`/teachers/${newTeacher._id}/dashboard`);
});

app.get("/teachers/:id/dashboard", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();

  let photoBase64 = "";
  if (teacher.photo?.data) {
    photoBase64 = `data:${teacher.photo.contentType};base64,${teacher.photo.data.toString("base64")}`;
  }

  const assignedSubjects = await Subject.find({ assignedTeacher: teacher.fullName }).lean();
  const timetable = await Timetable.find({ teacher: teacher.fullName }).lean();

  res.render("teacherDashboard", {
    teacher,
    photoBase64,
    assignedSubjects,
    timetable
  });
});

// ================= SUBJECTS =================
app.get("/subjects", async (req, res) => {
  const subjects = await Subject.find().lean();
  const teachers = await Teacher.find().lean();

  res.render("manage-subjects", { subjects, teachers });
});

app.post("/subjects", async (req, res) => {
  await Subject.create(req.body.subject);
  res.redirect("/subjects");
});

// ================= EXAMS =================
app.get("/exams", async (req, res) => {
  const exams = await Exam.find().lean();
  const subjects = await Subject.find().lean();

  res.render("manage-exams", { exams, subjects });
});

app.post("/exams", async (req, res) => {
  await Exam.create(req.body.exam);
  res.redirect("/exams");
});

// ================= FEES =================
app.get("/fees", async (req, res) => {
  const fees = await Fee.find().lean();
  const students = await Student.find().lean();

  res.render("manage-fees", { fees, students });
});

app.post("/fees", async (req, res) => {
  await Fee.create(req.body.fee);
  res.redirect("/fees");
});

// ================= HOSTELS =================
app.get("/hostels", async (req, res) => {
  const hostels = await Hostel.find().lean();
  res.render("manage-hostels", { hostels });
});

app.post("/hostels", async (req, res) => {
  await Hostel.create(req.body.hostel);
  res.redirect("/hostels");
});

// ================= TIMETABLE =================
app.get("/timetables", async (req, res) => {
  const timetables = await Timetable.find().lean();
  const teachers = await Teacher.find().lean();
  const subjects = await Subject.find().lean();

  res.render("manage-timetables", { timetables, teachers, subjects });
});

app.post("/timetables", async (req, res) => {
  await Timetable.create(req.body.timetable);
  res.redirect("/timetables");
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});