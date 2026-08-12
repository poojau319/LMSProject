const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

// =====================================================
// CREATE ASSIGNMENT - INSTRUCTOR
// =====================================================

const createAssignment = async (req, res) => {
  try {
    const {
      course,
      title,
      description,
      dueDate,
      totalMarks,
    } = req.body;

    if (!course) {
      return res.status(400).json({
        message: "Course is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Assignment title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Assignment description is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        message: "Due date is required",
      });
    }

    const marks = Number(totalMarks);

    if (!marks || marks <= 0) {
      return res.status(400).json({
        message: "Total marks must be greater than 0",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    const courseData = await Course.findById(course);

    if (!courseData) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      courseData.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const assignment = await Assignment.create({
      course,
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDueDate,
      fileUrl: req.file?.path || "",
      totalMarks: marks,
    });

    res.status(201).json({
      message: "Assignment created successfully ✅",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET COURSE ASSIGNMENTS
// Instructor OR enrolled student
// =====================================================

const getAssignments = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.courseId
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const isInstructor =
      course.instructor.toString() === req.user.id;

    const isStudent = course.students?.some(
      (student) =>
        student.toString() === req.user.id
    );

    if (!isInstructor && !isStudent) {
      return res.status(403).json({
        message:
          "You are not allowed to access these assignments",
      });
    }

    const assignments = await Assignment.find({
      course: course._id,
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .populate(
        "submissions.student",
        "name email"
      );

    res.json(assignments);
  } catch (error) {
    console.error("Get assignments error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ASSIGNMENT
// =====================================================

const getAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      ).populate(
        "submissions.student",
        "name email"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const isInstructor =
      course.instructor.toString() === req.user.id;

    const isStudent = course.students?.some(
      (student) =>
        student.toString() === req.user.id
    );

    if (!isInstructor && !isStudent) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Get assignment error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE ASSIGNMENT - INSTRUCTOR
// =====================================================

const updateAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const {
      title,
      description,
      dueDate,
      totalMarks,
    } = req.body;

    if (
      title !== undefined &&
      !title.trim()
    ) {
      return res.status(400).json({
        message: "Assignment title is required",
      });
    }

    if (
      description !== undefined &&
      !description.trim()
    ) {
      return res.status(400).json({
        message:
          "Assignment description is required",
      });
    }

    if (title !== undefined) {
      assignment.title = title.trim();
    }

    if (description !== undefined) {
      assignment.description =
        description.trim();
    }

    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }

      assignment.dueDate = parsedDueDate;
    }

    if (totalMarks !== undefined) {
      const marks = Number(totalMarks);

      if (!marks || marks <= 0) {
        return res.status(400).json({
          message:
            "Total marks must be greater than 0",
        });
      }

      assignment.totalMarks = marks;
    }

    // New file uploaded => replace old URL
    if (req.file?.path) {
      assignment.fileUrl = req.file.path;
    }

    await assignment.save();

    res.json({
      message: "Assignment updated successfully ✅",
      assignment,
    });
  } catch (error) {
    console.error(
      "Update assignment error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE ASSIGNMENT - INSTRUCTOR
// =====================================================

const deleteAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    await assignment.deleteOne();

    res.json({
      message: "Assignment deleted successfully ✅",
    });
  } catch (error) {
    console.error(
      "Delete assignment error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// STUDENT SUBMIT / RESUBMIT ASSIGNMENT
// =====================================================

const submitAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const isEnrolled =
      course.students?.some(
        (student) =>
          student.toString() === req.user.id
      );

    if (!isEnrolled) {
      return res.status(403).json({
        message:
          "You are not enrolled in this course",
      });
    }

    if (!req.file?.path) {
      return res.status(400).json({
        message: "Submission file is required",
      });
    }

    const existingSubmission =
      assignment.submissions.find(
        (submission) =>
          submission.student.toString() ===
          req.user.id
      );

    if (existingSubmission) {
      existingSubmission.fileUrl =
        req.file.path;

      existingSubmission.submittedAt =
        new Date();

      // Reset grade on resubmission
      existingSubmission.marks = null;
      existingSubmission.feedback = "";
      existingSubmission.gradedAt = null;
    } else {
      assignment.submissions.push({
        student: req.user.id,
        fileUrl: req.file.path,
        submittedAt: new Date(),
        marks: null,
        feedback: "",
        gradedAt: null,
      });
    }

    await assignment.save();

    res.json({
      message: existingSubmission
        ? "Assignment resubmitted successfully ✅"
        : "Assignment submitted successfully ✅",
      assignment,
    });
  } catch (error) {
    console.error(
      "Submit assignment error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SUBMISSIONS - INSTRUCTOR
// =====================================================

const getSubmissions = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      ).populate(
        "submissions.student",
        "name email"
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    res.json({
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      totalMarks: assignment.totalMarks,
      submissions: assignment.submissions || [],
    });
  } catch (error) {
    console.error(
      "Get submissions error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GRADE ASSIGNMENT - INSTRUCTOR
// =====================================================

const gradeAssignment = async (req, res) => {
  try {
    const {
      studentId,
      marks,
      feedback,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
      });
    }

    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (
      course.instructor.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const submission =
      assignment.submissions.find(
        (sub) =>
          sub.student.toString() ===
          studentId
      );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const numericMarks = Number(marks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > assignment.totalMarks
    ) {
      return res.status(400).json({
        message: `Marks must be between 0 and ${assignment.totalMarks}`,
      });
    }

    submission.marks = numericMarks;
    submission.feedback =
      feedback?.trim() || "";
    submission.gradedAt = new Date();

    await assignment.save();

    // =================================================
    // UPDATE STUDENT ASSIGNMENT PROGRESS
    // =================================================

    const courseAssignments =
      await Assignment.find({
        course: assignment.course,
      });

    let totalPossibleMarks = 0;
    let totalObtainedMarks = 0;

    courseAssignments.forEach(
      (currentAssignment) => {
        totalPossibleMarks +=
          Number(
            currentAssignment.totalMarks
          ) || 0;

        const studentSubmission =
          currentAssignment.submissions.find(
            (sub) =>
              sub.student.toString() ===
              studentId
          );

        if (
          studentSubmission &&
          studentSubmission.marks !== null &&
          studentSubmission.marks !== undefined
        ) {
          totalObtainedMarks +=
            Number(studentSubmission.marks) || 0;
        }
      }
    );

    const assignmentPercentage =
      totalPossibleMarks > 0
        ? (totalObtainedMarks /
            totalPossibleMarks) *
          100
        : 0;

    const progress =
      await Progress.findOneAndUpdate(
        {
          student: studentId,
          course: assignment.course,
        },
        {
          $set: {
            assignmentMarks: Math.round(
              assignmentPercentage
            ),
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

    // =================================================
    // OVERALL PROGRESS
    // =================================================

    const lecturePercentage =
      progress.totalLectures > 0
        ? (progress.completedLectures /
            progress.totalLectures) *
          100
        : 0;

    const quizPercentage = Number(
      progress.quizScore || 0
    );

    const overallPercentage = Math.round(
      (lecturePercentage +
        quizPercentage +
        assignmentPercentage) /
        3
    );

    progress.percentage = Math.min(
      Math.max(overallPercentage, 0),
      100
    );

    await progress.save();

    res.json({
      message:
        "Assignment graded successfully ✅",
      assignment,
      submission,
      progress,
    });
  } catch (error) {
    console.error(
      "Grade assignment error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET MY SUBMISSION - STUDENT
// =====================================================

const getMySubmission = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const course = await Course.findById(
      assignment.course
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const isEnrolled =
      course.students?.some(
        (student) =>
          student.toString() === req.user.id
      );

    if (!isEnrolled) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    const submission =
      assignment.submissions.find(
        (sub) =>
          sub.student.toString() ===
          req.user.id
      );

    res.json({
      submitted: Boolean(submission),
      submission: submission || null,
      totalMarks: assignment.totalMarks,
      dueDate: assignment.dueDate,
    });
  } catch (error) {
    console.error(
      "Get my submission error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeAssignment,
  getMySubmission,
};