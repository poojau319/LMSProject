const express = require("express");

const router = express.Router();

const {
  getQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  submitQuiz,
  getQuizAttempts,
  deleteQuizAttempt,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =====================================================
// GET COURSE QUIZ
// Instructor / Enrolled Student
// =====================================================

router.get(
  "/:courseId",
  protect,
  getQuiz
);

// =====================================================
// ADD QUIZ QUESTION - INSTRUCTOR
// =====================================================

router.post(
  "/:courseId/add",
  protect,
  authorizeRoles("instructor"),
  addQuizQuestion
);

// =====================================================
// UPDATE QUIZ QUESTION - INSTRUCTOR
// =====================================================

router.put(
  "/:courseId/:quizId",
  protect,
  authorizeRoles("instructor"),
  updateQuizQuestion
);

// =====================================================
// DELETE QUIZ QUESTION - INSTRUCTOR
// =====================================================

router.delete(
  "/:courseId/:quizId",
  protect,
  authorizeRoles("instructor"),
  deleteQuizQuestion
);

// =====================================================
// GET QUIZ ATTEMPTS - INSTRUCTOR
// =====================================================

router.get(
  "/:courseId/attempts",
  protect,
  authorizeRoles("instructor"),
  getQuizAttempts
);

// =====================================================
// DELETE QUIZ ATTEMPT - INSTRUCTOR
// =====================================================

router.delete(
  "/:courseId/attempts/:attemptId",
  protect,
  authorizeRoles("instructor"),
  deleteQuizAttempt
);

// =====================================================
// SUBMIT QUIZ - STUDENT
// =====================================================

router.post(
  "/:courseId/submit",
  protect,
  authorizeRoles("student"),
  submitQuiz
);

module.exports = router;