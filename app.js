require("dotenv").config();
const Assignment = require("./models/Assignment");
const Marks = require("./models/Marks");
const Attendance = require("./models/Attendance");
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

// ================= DB =================
mongoose.connect(MONGO)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err.message));

// ================= VIEW =================
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

// HOME
app.get("/", (req, res) => res.render("home"));

// LOGIN
app.get("/login", (req, res) => res.render("login"));

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
    res.send("Login error");
  }
});

// REGISTER
app.get("/register", (req, res) => res.render("register"));

app.post("/register", async (req, res) => {
  try {
    const { role, name, email } = req.body;

    if (role === "admin") {
      await Admin.create({
        name,
        email
      });
    }

    if (role === "teacher") {
      await Teacher.create({
        fullName: name,
        email,
        phone: req.body.teacherPhone,
        subject: req.body.subject,
        department: req.body.department
      });
    }

    if (role === "student") {
      await Student.create({
        fullName: name,
        email,
        rollNumber: req.body.rollNumber,
        phone: req.body.studentPhone,
        class: req.body.class,
        hostel: req.body.hostel
      });
    }

    res.redirect("/login");

  } catch (err) {
    console.error(err);
    res.send("Registration Error");
  }
});

// ================= ADMIN DASHBOARD =================
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
app.get("/students", async (req, res) => {
  res.render("manage-students", {
    students: await Student.find().lean()
  });
});

app.post("/students", upload.single("studentPhoto"), async (req, res) => {
  const newStudent = new Student(req.body.student);

  if (req.file) {
    newStudent.photo = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  await newStudent.save();
  res.redirect("/students");
});

app.get("/students/:id/edit", async (req, res) => {
  res.render("edit-student", {
    student: await Student.findById(req.params.id).lean()
  });
});

app.put("/students/:id", async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body.student);
  res.redirect("/students");
});

app.delete("/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect("/students");
});

app.get("/students/:id/dashboard", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();

    if (!student) return res.send("Student not found");

    // Convert photo
    let photoBase64 = "";
    if (student.photo?.data) {
      photoBase64 = `data:${student.photo.contentType};base64,${student.photo.data.toString("base64")}`;
    }

    // 👉 ADD THIS (timetable fetch)
    const timetable = await Timetable.find({ class: student.class }).lean();

    // 👉 FINAL RENDER
    res.render("studentDashboard", {
      student,
      photoBase64,
      timetable
    });

  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});

// VIEW ASSIGNMENTS
app.get("/students/:id/assignments", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  const assignments = await Assignment.find({
    subject: student.class   // match class
  }).lean();

  res.render("studentAssignments", { student, assignments });
});

// SUBMIT ASSIGNMENT
app.post("/assignments/:id/submit", upload.single("file"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    assignment.submissions.push({
      studentName: req.body.studentName,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await assignment.save();

    res.redirect("back");

  } catch (err) {
    console.error(err);
    res.send("Submission error");
  }
});

app.get("/students/:id/attendance", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  const attendance = await Attendance.find({
    studentName: student.fullName
  }).lean();

  res.render("studentAttendance", { student, attendance });
});

app.get("/students/:id/results", async (req, res) => {
  const student = await Student.findById(req.params.id).lean();

  const marks = await Marks.find({
    studentName: student.fullName
  }).lean();

  res.render("studentMarks", { student, marks });
});


// ================= TEACHERS =================
app.get("/teachers", async (req, res) => {
  res.render("manage-teachers", {
    teachers: await Teacher.find().lean()
  });
});

app.post("/teachers", upload.single("teacherPhoto"), async (req, res) => {
  const newTeacher = new Teacher(req.body.teacher);

  if (req.file) {
    newTeacher.photo = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  await newTeacher.save();
  res.redirect("/teachers");
});

app.get("/teachers/:id/edit", async (req, res) => {
  res.render("edit-teacher", {
    teacher: await Teacher.findById(req.params.id).lean()
  });
});

app.put("/teachers/:id", async (req, res) => {
  await Teacher.findByIdAndUpdate(req.params.id, req.body.teacher);
  res.redirect("/teachers");
});

app.delete("/teachers/:id", async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.redirect("/teachers");
});

app.get("/teachers/:id/dashboard", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();

  let photoBase64 = "";
  if (teacher.photo?.data) {
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

// VIEW ALL SUBMISSIONS OF ONE ASSIGNMENT
app.get("/assignments/:id/submissions", async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();

  res.render("viewSubmissions", { assignment });
});

app.post("/assignments/:id/grade/:index", async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  const sub = assignment.submissions[req.params.index];

  sub.marks = req.body.marks;
  sub.feedback = req.body.feedback;

  await assignment.save();

  res.redirect("back");
});
// GET page
app.get("/teachers/:id/assignments", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();

  const assignments = await Assignment.find({
    teacher: teacher.fullName
  }).lean();

  res.render("teacherAssignments", { teacher, assignments });
});

// POST (upload assignment)
app.post("/assignments", upload.single("file"), async (req, res) => {
  try {
    const { assignment } = req.body;

    const newAssignment = new Assignment({
      title: assignment.title,
      subject: assignment.subject,
      teacher: assignment.teacher,
      description: assignment.description,
      dueDate: assignment.dueDate
    });

    if (req.file) {
      newAssignment.file = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await newAssignment.save();

    res.redirect("back");

  } catch (err) {
    console.error(err);
    res.send("Error uploading assignment");
  }
});

app.get("/teachers/:id/attendance", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();
  const students = await Student.find().lean();

  res.render("teacherAttendance", { teacher, students });
});

app.post("/attendance", async (req, res) => {
  try {
    const { records } = req.body;

    const attendanceData = [];

    for (let studentName in records) {
      attendanceData.push({
        studentName,
        subject: req.body.subject,
        status: records[studentName],
        teacher: req.body.teacher
      });
    }

    await Attendance.insertMany(attendanceData);

    res.redirect("back");

  } catch (err) {
    console.error(err);
    res.send("Error marking attendance");
  }
});

app.get("/teachers/:id/marks", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).lean();
  const students = await Student.find().lean();
  const marks = await Marks.find().lean();

  res.render("teacherMarks", { teacher, students, marks });
});

app.post("/marks", async (req, res) => {
  try {
    const { marks } = req.body;

    await Marks.create({
      studentName: marks.studentName,
      subject: marks.subject,
      marks: marks.marks,
      examType: marks.examType,
      teacher: marks.teacher
    });

    res.redirect("back");

  } catch (err) {
    console.error(err);
    res.send("Error adding marks");
  }
});

app.put("/marks/:id", async (req, res) => {
  await Marks.findByIdAndUpdate(req.params.id, req.body.marks);
  res.redirect("back");
});

// ================= SUBJECTS =================
app.get("/subjects", async (req, res) => {
  res.render("manage-subjects", {
    subjects: await Subject.find().lean(),
    teachers: await Teacher.find().lean()
  });
});

app.post("/subjects", async (req, res) => {
  await Subject.create(req.body.subject);
  res.redirect("/subjects");
});

app.get("/subjects/:id/edit", async (req, res) => {
  res.render("edit-subject", {
    subject: await Subject.findById(req.params.id).lean()
  });
});

app.put("/subjects/:id", async (req, res) => {
  await Subject.findByIdAndUpdate(req.params.id, req.body.subject);
  res.redirect("/subjects");
});

app.delete("/subjects/:id", async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.redirect("/subjects");
});


// ================= EXAMS =================
app.get("/exams", async (req, res) => {
  res.render("manage-exams", {
    exams: await Exam.find().lean(),
    subjects: await Subject.find().lean()
  });
});

app.post("/exams", async (req, res) => {
  await Exam.create(req.body.exam);
  res.redirect("/exams");
});

app.get("/exams/:id/edit", async (req, res) => {
  res.render("edit-exam", {
    exam: await Exam.findById(req.params.id).lean()
  });
});

app.put("/exams/:id", async (req, res) => {
  await Exam.findByIdAndUpdate(req.params.id, req.body.exam);
  res.redirect("/exams");
});

app.delete("/exams/:id", async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.redirect("/exams");
});


// ================= FEES =================
app.get("/fees", async (req, res) => {
  res.render("manage-fees", {
    fees: await Fee.find().lean(),
    students: await Student.find().lean()
  });
});

app.post("/fees", async (req, res) => {
  await Fee.create(req.body.fee);
  res.redirect("/fees");
});

app.get("/fees/:id/edit", async (req, res) => {
  res.render("edit-fee", {
    fee: await Fee.findById(req.params.id).lean()
  });
});

app.put("/fees/:id", async (req, res) => {
  await Fee.findByIdAndUpdate(req.params.id, req.body.fee);
  res.redirect("/fees");
});

app.delete("/fees/:id", async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.redirect("/fees");
});


// ================= HOSTELS =================
app.get("/hostels", async (req, res) => {
  res.render("manage-hostels", {
    hostels: await Hostel.find().lean()
  });
});

app.post("/hostels", async (req, res) => {
  await Hostel.create(req.body.hostel);
  res.redirect("/hostels");
});

app.get("/hostels/:id/edit", async (req, res) => {
  res.render("edit-hostel", {
    hostel: await Hostel.findById(req.params.id).lean()
  });
});

app.put("/hostels/:id", async (req, res) => {
  await Hostel.findByIdAndUpdate(req.params.id, req.body.hostel);
  res.redirect("/hostels");
});

app.delete("/hostels/:id", async (req, res) => {
  await Hostel.findByIdAndDelete(req.params.id);
  res.redirect("/hostels");
});


// ================= TIMETABLE =================
app.get("/timetables", async (req, res) => {
  res.render("manage-timetables", {
    timetables: await Timetable.find().lean(),
    teachers: await Teacher.find().lean(),
    subjects: await Subject.find().lean()
  });
});

app.post("/timetables", async (req, res) => {
  await Timetable.create(req.body.timetable);
  res.redirect("/timetables");
});

app.get("/timetables/:id/edit", async (req, res) => {
  res.render("edit-timetable", {
    timetable: await Timetable.findById(req.params.id).lean()
  });
});

app.put("/timetables/:id", async (req, res) => {
  await Timetable.findByIdAndUpdate(req.params.id, req.body.timetable);
  res.redirect("/timetables");
});

app.delete("/timetables/:id", async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.redirect("/timetables");
});


// ================= 404 =================
app.use((req, res) => res.send("Page not found"));

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});