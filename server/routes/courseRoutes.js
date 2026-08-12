const express = require("express");

const router = express.Router();



const {
  getCourses,
  getCourseById,
  addLecture,
  enrollCourse,
  getMyCourses,
  getProgress,

} = require("../controllers/courseController");



const protect = require("../middleware/authMiddleware");





// ================= GET ALL COURSES =================

router.get(
  "/",
  getCourses
);





// ================= GET STUDENT ENROLLED COURSES =================

router.get(
  "/my-courses",
  protect,
  getMyCourses
);





// ================= GET STUDENT PROGRESS =================

router.get(
  "/progress",
  protect,
  getProgress
);





// ================= ENROLL COURSE =================

router.post(
  "/enroll/:id",
  protect,
  enrollCourse
);





// ================= ADD LECTURE =================

router.post(
  "/:id/lectures",
  protect,
  addLecture
);





// ================= GET SINGLE COURSE =================

router.get(
  "/:id",
  getCourseById
);





module.exports = router;