require("dotenv").config();

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

// ================= CONFIG =================
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

// ================= DB =================
mongoose.connect(MONGO)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

mongoose.connection.on("connected", () => {
  console.log("🔥 DB READY");
});

// ================= MIDDLEWARE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/public", express.static(path.join(__dirname, "public")));

// ================= MULTER =================
const upload = multer({ storage: multer.memoryStorage() });

// ================= AUTH =================

// HOME
app.get("/", (req, res) => {
  res.render("home");
});

// REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { role, name, email } = req.body;

    if (role === "student") {
      await Student.create({ fullName: name, email });
    }

    if (role === "teacher") {
      await Teacher.create({ fullName: name, email });
    }

    res.redirect("/login");

  } catch (err) {
    console.error(err);
    res.send("Registration error");
  }
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { role, name, email } = req.body;

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

    res.send("Invalid role");

  } catch (err) {
    console.error(err);
    res.send("Login error");
  }
});

// ================= TEST DB =================
app.get("/test-db", async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.send(`✅ DB OK → Students: ${count}`);
  } catch {
    res.send("❌ DB FAILED");
  }
});

// ================= ADMIN =================
app.get("/admin/dashboard", async (req, res) => {
  res.render("adminDashboard", {
    totalStudents: await Student.countDocuments(),
    totalTeachers: await Teacher.countDocuments(),
    totalSubjects: await Subject.countDocuments(),
    totalExams: await Exam.countDocuments(),
    totalFees: await Fee.countDocuments(),
    totalHostel: await Hostel.countDocuments(),
    totalTimetables: await Timetable.countDocuments()
  });
});

// ================= STUDENTS =================

// LIST
app.get("/students", async (req, res) => {
  const students = await Student.find().lean();
  res.render("manage-students", { students });
});

// CREATE
app.post("/students", upload.single("studentPhoto"), async (req, res) => {
  try {
    const { student } = req.body;

    const newStudent = new Student({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      email: student.email,
      phone: student.phone,
      class: student.class,
      hostel: student.hostel,
      photo: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        : undefined
    });

    await newStudent.save();
    res.redirect("/students");

  } catch (err) {
    console.error(err);
    res.send("Error saving student");
  }
});

// DASHBOARD
app.get("/students/:id/dashboard", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  let photoBase64 = "";
  if (student?.photo?.data) {
    photoBase64 = `data:${student.photo.contentType};base64,${student.photo.data.toString("base64")}`;
  }

  res.render("studentDashboard", { student, photoBase64 });
});

// ================= TEACHERS =================

// LIST
app.get("/teachers", async (req, res) => {
  const teachers = await Teacher.find().lean();
  res.render("manage-teachers", { teachers });
});

// CREATE
app.post("/teachers", upload.single("teacherPhoto"), async (req, res) => {
  try {
    const { teacher } = req.body;

    const newTeacher = new Teacher({
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      department: teacher.department,
      photo: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        : undefined
    });

    await newTeacher.save();
    res.redirect(`/teachers/${newTeacher._id}/dashboard`);

  } catch (err) {
    console.error(err);
    res.send("Error saving teacher");
  }
});

// DASHBOARD
app.get("/teachers/:id/dashboard", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();

  let photoBase64 = "";
  if (teacher?.photo?.data) {
    photoBase64 = `data:${teacher.photo.contentType};base64,${teacher.photo.data.toString("base64")}`;
  }

  const assignedSubjects = await Subject.find({
    assignedTeacher: teacher.fullName
  }).lean();

  const timetable = await Timetable.find({
    teacher: teacher.fullName
  }).lean();

  res.render("teacherDashboard", {
    teacher,
    photoBase64,
    assignedSubjects,
    timetable
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});