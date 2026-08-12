const Progress = require("../models/Progress");
const Course = require("../models/Course");

// =====================================================
// HELPER - CREATE / GET PROGRESS
// =====================================================

const getOrCreateProgress = async (studentId, courseId) => {
  let progress = await Progress.findOne({
    student: studentId,
    course: courseId,
  });

  const course = await Course.findById(courseId).select(
    "title description duration level lectures quizzes"
  );

  if (!course) {
    return {
      error: "Course not found.",
    };
  }

  const totalLectures = Array.isArray(course.lectures)
    ? course.lectures.length
    : 0;

  // ---------------------------------------------------
  // CREATE PROGRESS IF NOT EXISTS
  // ---------------------------------------------------

  if (!progress) {
    progress = new Progress({
      student: studentId,
      course: courseId,
      completedLectures: 0,
      totalLectures,
      assignmentMarks: 0,
      quizScore: 0,
      percentage: 0,
      certificateIssued: false,
    });
  } else {
    // Always sync total lectures
    progress.totalLectures = totalLectures;
  }

  return {
    progress,
    course,
  };
};

// =====================================================
// CALCULATE OVERALL PERCENTAGE
//
// Lecture      = 1/3
// Assignment   = 1/3
// Quiz         = 1/3
// =====================================================

const calculatePercentage = (progress) => {
  const totalLectures =
    Number(progress.totalLectures) || 0;

  const completedLectures =
    Number(progress.completedLectures) || 0;

  // ---------------------------------------------------
  // LECTURE %
  // ---------------------------------------------------

  const lecturePercentage =
    totalLectures > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (completedLectures / totalLectures) * 100
          )
        )
      : 0;

  // ---------------------------------------------------
  // ASSIGNMENT %
  // ---------------------------------------------------

  const assignmentPercentage = Math.min(
    100,
    Math.max(
      0,
      Number(progress.assignmentMarks) || 0
    )
  );

  // ---------------------------------------------------
  // QUIZ %
  // ---------------------------------------------------

  const quizPercentage = Math.min(
    100,
    Math.max(
      0,
      Number(progress.quizScore) || 0
    )
  );

  // ---------------------------------------------------
  // OVERALL
  // ---------------------------------------------------

  progress.percentage = Math.round(
    (
      lecturePercentage +
      assignmentPercentage +
      quizPercentage
    ) / 3
  );

  // ---------------------------------------------------
  // CERTIFICATE
  // ---------------------------------------------------

  progress.certificateIssued =
    lecturePercentage >= 100 &&
    assignmentPercentage >= 100 &&
    quizPercentage >= 100;

  return progress.percentage;
};

// =====================================================
// GET MY ALL PROGRESS
// =====================================================

const getMyProgress = async (req, res) => {
  try {
    const courses = await Course.find({
      students: req.user.id,
    }).select(
      "title description duration level lectures quizzes"
    );

    const formattedProgress = [];

    for (const course of courses) {
      let progress = await Progress.findOne({
        student: req.user.id,
        course: course._id,
      });

      const totalLectures =
        Array.isArray(course.lectures)
          ? course.lectures.length
          : 0;

      // -------------------------------------------------
      // CREATE IF MISSING
      // -------------------------------------------------

      if (!progress) {
        progress = new Progress({
          student: req.user.id,
          course: course._id,
          completedLectures: 0,
          totalLectures,
          assignmentMarks: 0,
          quizScore: 0,
          percentage: 0,
          certificateIssued: false,
        });
      }

      // -------------------------------------------------
      // ALWAYS SYNC TOTAL LECTURES
      // -------------------------------------------------

      progress.totalLectures = totalLectures;

      // -------------------------------------------------
      // ALWAYS RECALCULATE
      // -------------------------------------------------

      calculatePercentage(progress);

      // -------------------------------------------------
      // ALWAYS SAVE
      // -------------------------------------------------

      await progress.save();

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      formattedProgress.push({
        _id: progress._id,

        courseId: course._id,

        courseName:
          course.title || "Course",

        description:
          course.description || "",

        duration:
          course.duration || "",

        level:
          course.level || "",

        completedLectures:
          Number(progress.completedLectures) || 0,

        totalLectures:
          totalLectures,

        assignmentMarks:
          Number(progress.assignmentMarks) || 0,

        quizScore:
          Number(progress.quizScore) || 0,

        percentage: Math.min(
          100,
          Math.max(
            0,
            Number(progress.percentage) || 0
          )
        ),

        certificateIssued:
          Boolean(progress.certificateIssued),

        assignments: [],
      });
    }

    // Highest progress first
    formattedProgress.sort(
      (a, b) =>
        Number(b.percentage) -
        Number(a.percentage)
    );

    res.json(formattedProgress);
  } catch (error) {
    console.error(
      "Get my progress error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load learning progress.",
    });
  }
};

// =====================================================
// GET SINGLE COURSE PROGRESS
// =====================================================

const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result =
      await getOrCreateProgress(
        req.user.id,
        courseId
      );

    if (result.error) {
      return res.status(404).json({
        message: result.error,
      });
    }

    const { progress, course } = result;

    calculatePercentage(progress);

    await progress.save();

    res.json({
      _id: progress._id,

      student: progress.student,

      course: progress.course,

      courseName:
        course.title,

      completedLectures:
        Number(progress.completedLectures) || 0,

      totalLectures:
        Number(progress.totalLectures) || 0,

      assignmentMarks:
        Number(progress.assignmentMarks) || 0,

      quizScore:
        Number(progress.quizScore) || 0,

      percentage:
        Number(progress.percentage) || 0,

      certificateIssued:
        Boolean(progress.certificateIssued),

      updatedAt:
        progress.updatedAt,
    });
  } catch (error) {
    console.error(
      "Get course progress error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load course progress.",
    });
  }
};

// =====================================================
// UPDATE LECTURE PROGRESS
// =====================================================

const updateLectureProgress = async (
  req,
  res
) => {
  try {
    const { courseId } = req.params;

    const {
      completedLectures,
    } = req.body;

    const result =
      await getOrCreateProgress(
        req.user.id,
        courseId
      );

    if (result.error) {
      return res.status(404).json({
        message: result.error,
      });
    }

    const { progress } = result;

    let completed =
      Number(completedLectures);

    if (Number.isNaN(completed)) {
      completed =
        Number(
          progress.completedLectures
        ) || 0;
    }

    completed = Math.max(
      0,
      Math.floor(completed)
    );

    // Cannot exceed total lectures
    if (
      completed >
      progress.totalLectures
    ) {
      completed =
        progress.totalLectures;
    }

    progress.completedLectures =
      completed;

    // Recalculate lecture + assignment + quiz
    calculatePercentage(progress);

    await progress.save();

    res.json({
      message:
        "Lecture progress updated successfully ✅",

      progress: {
        completedLectures:
          progress.completedLectures,

        totalLectures:
          progress.totalLectures,

        assignmentMarks:
          progress.assignmentMarks,

        quizScore:
          progress.quizScore,

        percentage:
          progress.percentage,

        certificateIssued:
          progress.certificateIssued,
      },
    });
  } catch (error) {
    console.error(
      "Update lecture progress error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update lecture progress.",
    });
  }
};

// =====================================================
// UPDATE QUIZ + ASSIGNMENT PROGRESS
// =====================================================

const updateProgress = async (
  req,
  res
) => {
  try {
    const { courseId } = req.params;

    const {
      quizScore,
      assignmentMarks,
    } = req.body;

    const result =
      await getOrCreateProgress(
        req.user.id,
        courseId
      );

    if (result.error) {
      return res.status(404).json({
        message: result.error,
      });
    }

    const { progress } = result;

    // =================================================
    // QUIZ
    // =================================================

    if (
      quizScore !== undefined &&
      quizScore !== null
    ) {
      const score =
        Number(quizScore);

      if (!Number.isNaN(score)) {
        progress.quizScore =
          Math.min(
            100,
            Math.max(
              0,
              score
            )
          );
      }
    }

    // =================================================
    // ASSIGNMENT
    // =================================================

    if (
      assignmentMarks !== undefined &&
      assignmentMarks !== null
    ) {
      const marks =
        Number(assignmentMarks);

      if (!Number.isNaN(marks)) {
        progress.assignmentMarks =
          Math.min(
            100,
            Math.max(
              0,
              marks
            )
          );
      }
    }

    // =================================================
    // RECALCULATE EVERYTHING
    // =================================================

    calculatePercentage(progress);

    await progress.save();

    res.json({
      message:
        "Progress updated successfully ✅",

      progress: {
        completedLectures:
          progress.completedLectures,

        totalLectures:
          progress.totalLectures,

        assignmentMarks:
          progress.assignmentMarks,

        quizScore:
          progress.quizScore,

        percentage:
          progress.percentage,

        certificateIssued:
          progress.certificateIssued,
      },
    });
  } catch (error) {
    console.error(
      "Update progress error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update progress.",
    });
  }
};
// =====================================================
// DOWNLOAD CERTIFICATE
// =====================================================

const downloadCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found.",
      });
    }

    // Make sure latest progress is calculated
    calculatePercentage(progress);
    await progress.save();

    // Certificate only after complete
    if (!progress.certificateIssued) {
      return res.status(403).json({
        message:
          "Complete the course, assignment and quiz to get your certificate.",
      });
    }

    const course = await Course.findById(courseId).select(
      "title"
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    const User = require("../models/User");

    const student = await User.findById(
      req.user.id
    ).select("name email");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const PDFDocument = require("pdfkit");

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate-${course.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}.pdf"`
    );

    doc.pipe(res);

    // =================================================
    // CERTIFICATE DESIGN
    // =================================================

    doc
      .fontSize(30)
      .font("Helvetica-Bold")
      .text("CERTIFICATE OF COMPLETION", {
        align: "center",
        y: 100,
      });

    doc
      .fontSize(16)
      .font("Helvetica")
      .text("This certificate is proudly presented to", {
        align: "center",
        y: 180,
      });

    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(student.name || "Student", {
        align: "center",
        y: 220,
      });

    doc
      .fontSize(16)
      .font("Helvetica")
      .text(
        "for successfully completing the course",
        {
          align: "center",
          y: 275,
        }
      );

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(course.title || "Course", {
        align: "center",
        y: 315,
      });

    doc
      .fontSize(14)
      .font("Helvetica")
      .text(
        "The student has successfully completed all required",
        {
          align: "center",
          y: 370,
        }
      );

    doc.text(
      "lectures, assignment and quiz.",
      {
        align: "center",
      }
    );

    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(
        `Overall Progress: ${progress.percentage}%`,
        {
          align: "center",
          y: 440,
        }
      );

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `Issued on: ${new Date().toLocaleDateString()}`,
        {
          align: "center",
          y: 500,
        }
      );

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "Learning Management System",
        {
          align: "center",
          y: 560,
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Download certificate error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to generate certificate.",
    });
  }
};
// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getMyProgress,
  getProgress,
  updateLectureProgress,
  updateProgress,
  downloadCertificate,
};