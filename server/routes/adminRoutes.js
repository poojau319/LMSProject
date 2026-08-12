const express = require("express");

const router = express.Router();

const {
  getDashboard,

  getAllUsers,
  deleteUser,

  getAllCourses,
  approveCourse,
  rejectCourse,

  getRevenue,

  getAnalytics,

  getAllFeedback,
  deleteFeedback,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getEligibleStudents,
  issueCertificate,
  getAllCertificates,
  revokeCertificate,
} = require("../controllers/certificateController");


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboard
);


// ======================================================
// USER MANAGEMENT
// ======================================================

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);


// ======================================================
// COURSE APPROVAL
// ======================================================

router.get(
  "/courses",
  protect,
  authorizeRoles("admin"),
  getAllCourses
);

router.put(
  "/courses/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveCourse
);

router.put(
  "/courses/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectCourse
);


// ======================================================
// REVENUE
// ======================================================

router.get(
  "/revenue",
  protect,
  authorizeRoles("admin"),
  getRevenue
);


// ======================================================
// ANALYTICS
// ======================================================

router.get(
  "/analytics",
  protect,
  authorizeRoles("admin"),
  getAnalytics
);


// ======================================================
// FEEDBACK
// ======================================================

router.get(
  "/feedback",
  protect,
  authorizeRoles("admin"),
  getAllFeedback
);

router.delete(
  "/feedback/:id",
  protect,
  authorizeRoles("admin"),
  deleteFeedback
);

// ======================================================
// CERTIFICATE MANAGEMENT
// ======================================================

router.get(
  "/certificates/eligible",
  protect,
  authorizeRoles("admin"),
  getEligibleStudents
);

router.get(
  "/certificates",
  protect,
  authorizeRoles("admin"),
  getAllCertificates
);

router.post(
  "/certificates/issue",
  protect,
  authorizeRoles("admin"),
  issueCertificate
);

router.put(
  "/certificates/:id/revoke",
  protect,
  authorizeRoles("admin"),
  revokeCertificate
);
module.exports = router;