const Purchase = require("../models/Purchase");
const Course = require("../models/Course");
const User = require("../models/User");
const Progress = require("../models/Progress");

// ================= CREATE PURCHASE =================

const createPurchase = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.status !== "Approved") {
      return res.status(400).json({
        message: "This course is not available for purchase.",
      });
    }

    if (student.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        message: "You are already enrolled in this course.",
      });
    }

    const existingPurchase = await Purchase.findOne({
      student: student._id,
      course: course._id,
      status: "Paid",
    });

    if (existingPurchase) {
      return res.status(400).json({
        message: "Course already purchased.",
      });
    }

    const purchase = await Purchase.create({
      student: student._id,
      course: course._id,
      amount: Number(course.price) || 0,
      status: "Paid",
      paymentMethod: "Demo Payment",
      transactionId:
        "TXN-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 10000),
    });

    student.enrolledCourses.push(course._id);

    course.students.push(student._id);
    course.totalStudents = course.students.length;

    await student.save();
    await course.save();

    await Progress.create({
      student: student._id,
      course: course._id,
      totalLectures: course.lectures.length,
    });

    res.status(201).json({
      message: "Course purchased successfully ✅",
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= MY PURCHASES =================

const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      student: req.user.id,
    })
      .populate("course", "title price image")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createPurchase,
  getMyPurchases,
};