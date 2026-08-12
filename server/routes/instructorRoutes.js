const express = require("express");

const router = express.Router();

const {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,

  addLecture,
  getLectures,
  updateLecture,
  deleteLecture,

  getStudentPerformance,
} = require("../controllers/instructorController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =====================================================
// CREATE COURSE
// =====================================================

router.post(
  "/create-course",
  protect,
  authorizeRoles("instructor"),
  createCourse
);

// =====================================================
// GET MY COURSES
// =====================================================

router.get(
  "/my-courses",
  protect,
  authorizeRoles("instructor"),
  getInstructorCourses
);

// =====================================================
// UPDATE COURSE
// =====================================================

router.put(
  "/update-course/:id",
  protect,
  authorizeRoles("instructor"),
  updateCourse
);

// =====================================================
// DELETE COURSE
// =====================================================

router.delete(
  "/delete-course/:id",
  protect,
  authorizeRoles("instructor"),
  deleteCourse
);
//Lecture Section
router.post(
  "/:id/add-lecture",
  protect,
  authorizeRoles("instructor"),
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  addLecture
);

router.get(
  "/:id/lectures",
  protect,
  authorizeRoles("instructor"),
  getLectures
);

router.put(
  "/:id/lectures/:lectureId",
  protect,
  authorizeRoles("instructor"),
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  updateLecture
);

router.delete(
  "/:id/lectures/:lectureId",
  protect,
  authorizeRoles("instructor"),
  deleteLecture
);

// =====================================================
// STUDENT PERFORMANCE
// =====================================================

router.get(
  "/student-performance",
  protect,
  authorizeRoles("instructor"),
  getStudentPerformance
);

module.exports = router;