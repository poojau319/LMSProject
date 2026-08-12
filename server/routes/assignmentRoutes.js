const express = require("express");

const router = express.Router();

const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeAssignment,
  getMySubmission,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =====================================================
// CREATE ASSIGNMENT - INSTRUCTOR
// =====================================================

router.post(
  "/create",
  protect,
  authorizeRoles("instructor"),
  upload.single("file"),
  createAssignment
);

// =====================================================
// GET COURSE ASSIGNMENTS
// Instructor / Enrolled Student
// =====================================================

router.get(
  "/course/:courseId",
  protect,
  getAssignments
);

// =====================================================
// GET SINGLE ASSIGNMENT
// =====================================================

router.get(
  "/single/:assignmentId",
  protect,
  getAssignment
);

// =====================================================
// UPDATE ASSIGNMENT - INSTRUCTOR
// =====================================================

router.put(
  "/:assignmentId",
  protect,
  authorizeRoles("instructor"),
  upload.single("file"),
  updateAssignment
);

// =====================================================
// DELETE ASSIGNMENT - INSTRUCTOR
// =====================================================

router.delete(
  "/:assignmentId",
  protect,
  authorizeRoles("instructor"),
  deleteAssignment
);

// =====================================================
// STUDENT SUBMIT / RESUBMIT
// =====================================================

router.post(
  "/:assignmentId/submit",
  protect,
  authorizeRoles("student"),
  upload.single("file"),
  submitAssignment
);

// =====================================================
// STUDENT GET OWN SUBMISSION
// =====================================================

router.get(
  "/:assignmentId/my-submission",
  protect,
  authorizeRoles("student"),
  getMySubmission
);

// =====================================================
// INSTRUCTOR GET ALL SUBMISSIONS
// =====================================================

router.get(
  "/:assignmentId/submissions",
  protect,
  authorizeRoles("instructor"),
  getSubmissions
);

// =====================================================
// INSTRUCTOR GRADE / UPDATE GRADE
// =====================================================

router.put(
  "/:assignmentId/grade",
  protect,
  authorizeRoles("instructor"),
  gradeAssignment
);

module.exports = router;