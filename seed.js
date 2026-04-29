// seed.js
const mongoose = require("mongoose");

const Admin = require("./models/Admin");
const Teacher = require("./models/Teacher");
const Student = require("./models/Student");
const Subject = require("./models/Subject");
const Fee = require("./models/Fee");
const Hostel = require("./models/Hostel");
const Timetable = require("./models/Timetable");
const Exam = require("./models/Exam");

const MONGO = "mongodb://127.0.0.1:27017/erp-app";

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log("DB Connected");

    // 🔥 Clear old data
    await Promise.all([
      Admin.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Fee.deleteMany({}),
      Hostel.deleteMany({}),
      Timetable.deleteMany({}),
      Exam.deleteMany({})
    ]);

    // ================= ADMINS =================
    await Admin.insertMany([
      { name: "admin", email: "admin@erp.com" },
      { name: "superadmin", email: "super@erp.com" }
    ]);

    // ================= TEACHERS (10) =================
    const teachers = await Teacher.insertMany([
      { fullName: "Anita Sharma", email: "anita@college.com", phone: "9876501111", subject: "Physics", department: "Science" },
      { fullName: "Rajesh Kumar", email: "rajesh@college.com", phone: "9876502222", subject: "Mathematics", department: "Science" },
      { fullName: "Neha Gupta", email: "neha@college.com", phone: "9876503333", subject: "Chemistry", department: "Science" },
      { fullName: "Vikram Singh", email: "vikram@college.com", phone: "9876504444", subject: "Computer Science", department: "CS" },
      { fullName: "Pooja Mehta", email: "pooja@college.com", phone: "9876505555", subject: "English", department: "Arts" },
      { fullName: "Amit Verma", email: "amit@college.com", phone: "9876506666", subject: "History", department: "Arts" },
      { fullName: "Sunita Rao", email: "sunita@college.com", phone: "9876507777", subject: "Biology", department: "Science" },
      { fullName: "Rohit Jain", email: "rohit@college.com", phone: "9876508888", subject: "Economics", department: "Commerce" },
      { fullName: "Kiran Patel", email: "kiran@college.com", phone: "9876509999", subject: "Accounts", department: "Commerce" },
      { fullName: "Suresh Yadav", email: "suresh@college.com", phone: "9876500000", subject: "Statistics", department: "Science" }
    ]);

    // ================= STUDENTS (10) =================
    const students = await Student.insertMany([
      { fullName: "Prince Jaiswal", rollNumber: "S101", email: "prince@college.com", phone: "9956100001", class: "Class 10", hostel: "Not Allotted" },
      { fullName: "Rahul Sharma", rollNumber: "S102", email: "rahul@college.com", phone: "9956100002", class: "Class 11", hostel: "Hostel A" },
      { fullName: "Priya Singh", rollNumber: "S103", email: "priya@college.com", phone: "9956100003", class: "Class 12", hostel: "Hostel B" },
      { fullName: "Aman Gupta", rollNumber: "S104", email: "aman@college.com", phone: "9956100004", class: "B.Sc", hostel: "Hostel C" },
      { fullName: "Sneha Patel", rollNumber: "S105", email: "sneha@college.com", phone: "9956100005", class: "B.Com", hostel: "Not Allotted" },
      { fullName: "Ravi Kumar", rollNumber: "S106", email: "ravi@college.com", phone: "9956100006", class: "Class 10", hostel: "Hostel A" },
      { fullName: "Pankaj Verma", rollNumber: "S107", email: "pankaj@college.com", phone: "9956100007", class: "Class 11", hostel: "Hostel B" },
      { fullName: "Simran Kaur", rollNumber: "S108", email: "simran@college.com", phone: "9956100008", class: "Class 12", hostel: "Hostel C" },
      { fullName: "Nikhil Jain", rollNumber: "S109", email: "nikhil@college.com", phone: "9956100009", class: "B.Sc", hostel: "Not Allotted" },
      { fullName: "Riya Malhotra", rollNumber: "S110", email: "riya@college.com", phone: "9956100010", class: "B.Com", hostel: "Hostel A" }
    ]);

    // ================= SUBJECTS (10) =================
    await Subject.insertMany([
      { subjectName: "Physics", subjectCode: "PHY101", department: "Science", assignedTeacher: teachers[0].fullName },
      { subjectName: "Maths", subjectCode: "MAT101", department: "Science", assignedTeacher: teachers[1].fullName },
      { subjectName: "Chemistry", subjectCode: "CHE101", department: "Science", assignedTeacher: teachers[2].fullName },
      { subjectName: "CS", subjectCode: "CSE101", department: "CS", assignedTeacher: teachers[3].fullName },
      { subjectName: "English", subjectCode: "ENG101", department: "Arts", assignedTeacher: teachers[4].fullName },
      { subjectName: "History", subjectCode: "HIS101", department: "Arts", assignedTeacher: teachers[5].fullName },
      { subjectName: "Biology", subjectCode: "BIO101", department: "Science", assignedTeacher: teachers[6].fullName },
      { subjectName: "Economics", subjectCode: "ECO101", department: "Commerce", assignedTeacher: teachers[7].fullName },
      { subjectName: "Accounts", subjectCode: "ACC101", department: "Commerce", assignedTeacher: teachers[8].fullName },
      { subjectName: "Statistics", subjectCode: "STA101", department: "Science", assignedTeacher: teachers[9].fullName }
    ]);

    // ================= HOSTELS =================
    await Hostel.insertMany([
      { hostelName: "Hostel A", hostelType: "Boys", capacity: 100, wardenName: "Mr. Rakesh", fees: 3000 },
      { hostelName: "Hostel B", hostelType: "Girls", capacity: 90, wardenName: "Mrs. Meena", fees: 2800 },
      { hostelName: "Hostel C", hostelType: "Co-ed", capacity: 120, wardenName: "Mr. Sandeep", fees: 3200 },
      { hostelName: "Hostel D", hostelType: "Boys", capacity: 80, wardenName: "Mr. Ajay", fees: 2600 },
      { hostelName: "Hostel E", hostelType: "Girls", capacity: 70, wardenName: "Mrs. Kavita", fees: 2500 }
    ]);

    // ================= FEES =================
    await Fee.insertMany(
      students.map((s, i) => ({
        studentName: s.fullName,
        class: s.class,
        amount: 5000 + i * 500,
        dueDate: new Date("2025-09-15"),
        status: i % 2 === 0 ? "Paid" : "Pending"
      }))
    );

    // ================= EXAMS =================
    await Exam.insertMany([
      { examName: "Mid Term", examDate: "2025-09-20", class: "Class 10", subject: "Maths", examType: "Mid Term" },
      { examName: "Final Exam", examDate: "2025-12-10", class: "Class 12", subject: "Physics", examType: "Final" },
      { examName: "Unit Test 1", examDate: "2025-08-10", class: "Class 11", subject: "Chemistry", examType: "Unit Test" },
      { examName: "Unit Test 2", examDate: "2025-10-05", class: "B.Sc", subject: "CS", examType: "Unit Test" },
      { examName: "Practical", examDate: "2025-11-01", class: "B.Com", subject: "Accounts", examType: "Practical" },
      { examName: "Internal", examDate: "2025-09-30", class: "Class 10", subject: "English", examType: "Internal" }
    ]);

    // ================= TIMETABLE (10) =================
    await Timetable.insertMany([
      { class: "Class 10", subject: "Maths", teacher: teachers[1].fullName, day: "Monday", time: "10:00" },
      { class: "Class 10", subject: "Physics", teacher: teachers[0].fullName, day: "Tuesday", time: "11:00" },
      { class: "Class 11", subject: "Chemistry", teacher: teachers[2].fullName, day: "Wednesday", time: "09:00" },
      { class: "Class 12", subject: "English", teacher: teachers[4].fullName, day: "Thursday", time: "12:00" },
      { class: "B.Sc", subject: "CS", teacher: teachers[3].fullName, day: "Friday", time: "02:00" },
      { class: "B.Com", subject: "Accounts", teacher: teachers[8].fullName, day: "Monday", time: "03:00" },
      { class: "Class 11", subject: "Biology", teacher: teachers[6].fullName, day: "Tuesday", time: "10:00" },
      { class: "Class 12", subject: "Statistics", teacher: teachers[9].fullName, day: "Wednesday", time: "11:30" },
      { class: "B.Sc", subject: "Economics", teacher: teachers[7].fullName, day: "Thursday", time: "09:30" },
      { class: "Class 10", subject: "History", teacher: teachers[5].fullName, day: "Friday", time: "01:00" }
    ]);

    console.log("✅ SEEDING COMPLETE (All collections)");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
