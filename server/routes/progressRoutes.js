const express = require("express");

const router = express.Router();

const {
  getMyProgress,
  getProgress,
  updateLectureProgress,
  updateProgress,
  downloadCertificate,
} = require("../controllers/progressController");
const protect = require("../middleware/authMiddleware");


// ================= GET MY ALL PROGRESS =================

router.get(
  "/my",
  protect,
  getMyProgress
);


// ================= GET SINGLE COURSE PROGRESS =================

router.get(
  "/:courseId",
  protect,
  getProgress
);


// ================= UPDATE LECTURE PROGRESS =================

router.put(
  "/:courseId/lecture",
  protect,
  updateLectureProgress
);


// ================= UPDATE QUIZ + ASSIGNMENT =================

router.put(
  "/:courseId/update",
  protect,
  updateProgress
);
// ================= DOWNLOAD CERTIFICATE =================

router.get(
  "/:courseId/certificate",
  protect,
  downloadCertificate
);

module.exports = router;