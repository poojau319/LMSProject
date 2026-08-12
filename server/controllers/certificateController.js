const crypto = require("crypto");
const PDFDocument = require("pdfkit");

const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");


// ======================================================
// ADMIN - GET CERTIFICATE ELIGIBLE STUDENTS
// ======================================================

const getEligibleStudents = async (req, res) => {
  try {
    const progress = await Progress.find({
      percentage: { $gte: 90 },
    })
      .populate("student", "name email")
      .populate(
        "course",
        "title instructor duration level"
      )
      .sort({ updatedAt: -1 });

    const certificates = await Certificate.find({
      status: "Issued",
    }).select("student course");

    const issuedSet = new Set(
      certificates.map(
        (item) =>
          `${item.student.toString()}_${item.course.toString()}`
      )
    );

    const eligible = progress.map((item) => ({
      progressId: item._id,

      student: item.student,

      course: item.course,

      percentage: item.percentage,

      certificateIssued: issuedSet.has(
        `${item.student._id.toString()}_${item.course._id.toString()}`
      ),
    }));

    res.json(eligible);
  } catch (error) {
    console.error(
      "Eligible Certificate Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// ADMIN - ISSUE CERTIFICATE
// ======================================================

const issueCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        message:
          "Student and course are required.",
      });
    }

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({
        message: "Student progress not found.",
      });
    }

    if (Number(progress.percentage) < 90) {
      return res.status(400).json({
        message:
          "Student has not reached the required 90% completion.",
      });
    }

    const existing = await Certificate.findOne({
      student: studentId,
      course: courseId,
      status: "Issued",
    });

    if (existing) {
      return res.status(400).json({
        message:
          "Certificate has already been issued.",
      });
    }

    const certificateId =
      `LP-${new Date().getFullYear()}-` +
      crypto.randomBytes(4).toString("hex").toUpperCase();

    const certificate =
      await Certificate.create({
        certificateId,
        student: studentId,
        course: courseId,
        issuedBy: req.user.id,
      });

    const populatedCertificate =
      await Certificate.findById(
        certificate._id
      )
        .populate("student", "name email")
        .populate(
          "course",
          "title duration level"
        )
        .populate(
          "issuedBy",
          "name email"
        );

    res.status(201).json({
      message:
        "Certificate issued successfully 🎓",
      certificate: populatedCertificate,
    });
  } catch (error) {
    console.error(
      "Issue Certificate Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// ADMIN - GET ALL CERTIFICATES
// ======================================================

const getAllCertificates = async (req, res) => {
  try {
    const certificates =
      await Certificate.find()
        .populate("student", "name email")
        .populate(
          "course",
          "title duration level"
        )
        .populate(
          "issuedBy",
          "name email"
        )
        .sort({ issueDate: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// ADMIN - REVOKE CERTIFICATE
// ======================================================

const revokeCertificate = async (req, res) => {
  try {
    const certificate =
      await Certificate.findById(
        req.params.id
      );

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    if (certificate.status === "Revoked") {
      return res.status(400).json({
        message:
          "Certificate is already revoked.",
      });
    }

    certificate.status = "Revoked";

    await certificate.save();

    res.json({
      message:
        "Certificate revoked successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// STUDENT - GET MY CERTIFICATES
// ======================================================

const getMyCertificates = async (req, res) => {
  try {
    const certificates =
      await Certificate.find({
        student: req.user.id,
        status: "Issued",
      })
        .populate(
          "course",
          "title duration level"
        )
        .populate(
          "issuedBy",
          "name"
        )
        .sort({ issueDate: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// STUDENT - DOWNLOAD CERTIFICATE PDF
// ======================================================

const downloadCertificate = async (req, res) => {
  try {
    const certificate =
      await Certificate.findOne({
        _id: req.params.id,
        student: req.user.id,
        status: "Issued",
      })
        .populate("student", "name email")
        .populate(
          "course",
          "title duration level"
        )
        .populate(
          "issuedBy",
          "name"
        );

    if (!certificate) {
      return res.status(404).json({
        message:
          "Certificate not found.",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${certificate.certificateId}.pdf"`
    );

    doc.pipe(res);

    const width = 841.89;
    const height = 595.28;

    // Background
    doc
      .rect(0, 0, width, height)
      .fill("#f8fafc");

    // Outer border
    doc
      .lineWidth(8)
      .strokeColor("#2563eb")
      .rect(22, 22, width - 44, height - 44)
      .stroke();

    // Inner border
    doc
      .lineWidth(2)
      .strokeColor("#93c5fd")
      .rect(38, 38, width - 76, height - 76)
      .stroke();

    // Brand
    doc
      .fillColor("#1d4ed8")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(
        "LEARNING PORTAL",
        0,
        70,
        {
          align: "center",
          width,
        }
      );

    // Certificate title
    doc
      .fillColor("#111827")
      .fontSize(38)
      .font("Helvetica-Bold")
      .text(
        "CERTIFICATE OF COMPLETION",
        0,
        125,
        {
          align: "center",
          width,
        }
      );

    doc
      .fillColor("#6b7280")
      .fontSize(15)
      .font("Helvetica")
      .text(
        "This certificate is proudly presented to",
        0,
        190,
        {
          align: "center",
          width,
        }
      );

    // Student name
    doc
      .fillColor("#1e3a8a")
      .fontSize(34)
      .font("Helvetica-Bold")
      .text(
        certificate.student.name,
        0,
        225,
        {
          align: "center",
          width,
        }
      );

    // Line
    doc
      .moveTo(270, 275)
      .lineTo(570, 275)
      .lineWidth(1)
      .strokeColor("#cbd5e1")
      .stroke();

    doc
      .fillColor("#4b5563")
      .fontSize(15)
      .font("Helvetica")
      .text(
        "for successfully completing the course",
        0,
        300,
        {
          align: "center",
          width,
        }
      );

    // Course
    doc
      .fillColor("#111827")
      .fontSize(25)
      .font("Helvetica-Bold")
      .text(
        certificate.course.title,
        70,
        330,
        {
          align: "center",
          width: width - 140,
        }
      );

    // Bottom information
    const issueDate =
      new Date(
        certificate.issueDate
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    doc
      .fillColor("#6b7280")
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Certificate ID: ${certificate.certificateId}`,
        70,
        450
      );

    doc.text(
      `Issued on: ${issueDate}`,
      70,
      470
    );

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text(
        "Authorized by Learning Portal",
        580,
        460,
        {
          width: 190,
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Certificate PDF Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// VERIFY CERTIFICATE
// ======================================================

const verifyCertificate = async (req, res) => {
  try {
    const certificate =
      await Certificate.findOne({
        certificateId:
          req.params.certificateId,
        status: "Issued",
      })
        .populate(
          "student",
          "name"
        )
        .populate(
          "course",
          "title"
        );

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message:
          "Certificate is invalid or revoked.",
      });
    }

    res.json({
      valid: true,

      certificateId:
        certificate.certificateId,

      student:
        certificate.student.name,

      course:
        certificate.course.title,

      issueDate:
        certificate.issueDate,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getEligibleStudents,
  issueCertificate,
  getAllCertificates,
  revokeCertificate,
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
};