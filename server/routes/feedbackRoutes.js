const express = require("express");

const router = express.Router();



const {
  addFeedback,
  getCourseFeedback,

} = require("../controllers/feedbackController");



const protect = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");




// Add Feedback (Student Only)

router.post(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  addFeedback
);




// Get Course Feedback

router.get(
  "/:courseId",
  getCourseFeedback
);



module.exports = router;