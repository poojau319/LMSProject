const express = require("express");

const router = express.Router();

const {
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
} = require("../controllers/certificateController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// ======================================================
// STUDENT CERTIFICATES
// ======================================================

router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMyCertificates
);


router.get(
  "/download/:id",
  protect,
  authorizeRoles("student"),
  downloadCertificate
);


// ======================================================
// PUBLIC CERTIFICATE VERIFICATION
// ======================================================

router.get(
  "/verify/:certificateId",
  verifyCertificate
);


module.exports = router;