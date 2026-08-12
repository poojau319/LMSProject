const mongoose = require("mongoose");

const Course = require("../models/Course");
const QuizAttempt = require("../models/QuizAttempt");
const Progress = require("../models/Progress");

// =====================================================
// CONSTANTS
// =====================================================

const REQUIRED_OPTIONS = 4;

const MIN_QUESTION_LENGTH = 5;
const MAX_QUESTION_LENGTH = 500;

const MIN_OPTION_LENGTH = 1;
const MAX_OPTION_LENGTH = 200;

// =====================================================
// HELPER - VALIDATE QUIZ DATA
// =====================================================

const validateQuizData = ({
  question,
  options,
  answer,
}) => {
  const errors = [];

  // ---------------------------------------------------
  // QUESTION
  // ---------------------------------------------------

  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    errors.push("Question is required.");
  } else if (
    question.trim().length < MIN_QUESTION_LENGTH
  ) {
    errors.push(
      `Question must contain at least ${MIN_QUESTION_LENGTH} characters.`
    );
  } else if (
    question.trim().length > MAX_QUESTION_LENGTH
  ) {
    errors.push(
      `Question cannot exceed ${MAX_QUESTION_LENGTH} characters.`
    );
  }

  // ---------------------------------------------------
  // OPTIONS
  // ---------------------------------------------------

  if (!Array.isArray(options)) {
    errors.push("Options must be an array.");
  } else if (options.length !== REQUIRED_OPTIONS) {
    errors.push(
      `Exactly ${REQUIRED_OPTIONS} options are required.`
    );
  } else {
    const cleanedOptions = options.map((option) =>
      typeof option === "string"
        ? option.trim()
        : String(option ?? "").trim()
    );

    cleanedOptions.forEach((option, index) => {
      if (!option) {
        errors.push(
          `Option ${index + 1} cannot be empty.`
        );
      }

      if (
        option.length < MIN_OPTION_LENGTH ||
        option.length > MAX_OPTION_LENGTH
      ) {
        errors.push(
          `Option ${index + 1} must be between ${MIN_OPTION_LENGTH} and ${MAX_OPTION_LENGTH} characters.`
        );
      }
    });

    // -------------------------------------------------
    // DUPLICATE OPTIONS
    // -------------------------------------------------

    const normalizedOptions = cleanedOptions.map(
      (option) => option.toLowerCase()
    );

    const uniqueOptions = new Set(
      normalizedOptions
    );

    if (
      uniqueOptions.size !==
      normalizedOptions.length
    ) {
      errors.push(
        "All options must be unique."
      );
    }
  }

  // ---------------------------------------------------
  // ANSWER
  // ---------------------------------------------------

  if (
    typeof answer !== "string" ||
    !answer.trim()
  ) {
    errors.push(
      "Correct answer is required."
    );
  } else if (Array.isArray(options)) {
    const cleanedOptions = options.map((option) =>
      typeof option === "string"
        ? option.trim()
        : String(option ?? "").trim()
    );

    const answerExists = cleanedOptions.some(
      (option) =>
        option.toLowerCase() ===
        answer.trim().toLowerCase()
    );

    if (!answerExists) {
      errors.push(
        "Correct answer must match one of the options."
      );
    }
  }

  return errors;
};

// =====================================================
// HELPER - GET COURSE + CHECK INSTRUCTOR
// =====================================================

const getInstructorCourse = async (
  courseId,
  userId
) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return {
      error: {
        status: 400,
        message: "Invalid course ID.",
      },
    };
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return {
      error: {
        status: 404,
        message: "Course not found.",
      },
    };
  }

  if (
    course.instructor.toString() !==
    userId.toString()
  ) {
    return {
      error: {
        status: 403,
        message:
          "Access denied. Only the course instructor can manage quizzes.",
      },
    };
  }

  return { course };
};

// =====================================================
// GET COURSE QUIZZES
// Instructor / Enrolled Student
// =====================================================

const getQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    const course = await Course.findById(courseId)
      .select("title instructor students quizzes");

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    const isInstructor =
      course.instructor.toString() ===
      req.user.id;

    const isStudent =
      course.students?.some(
        (student) =>
          student.toString() === req.user.id
      );

    if (!isInstructor && !isStudent) {
      return res.status(403).json({
        message:
          "You are not allowed to access this quiz.",
      });
    }

    res.json(course.quizzes || []);
  } catch (error) {
    console.error(
      "Get quiz error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load quiz questions.",
    });
  }
};

// =====================================================
// ADD QUIZ QUESTION - INSTRUCTOR
// =====================================================

const addQuizQuestion = async (
  req,
  res
) => {
  try {
    const {
      question,
      options,
      answer,
    } = req.body;

    const validationErrors =
      validateQuizData({
        question,
        options,
        answer,
      });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors[0],
        errors: validationErrors,
      });
    }

    const result =
      await getInstructorCourse(
        req.params.courseId,
        req.user.id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          message: result.error.message,
        });
    }

    const course = result.course;

    const cleanedOptions = options.map(
      (option) => option.trim()
    );

    const cleanAnswer = answer.trim();

    // -------------------------------------------------
    // DUPLICATE QUESTION CHECK
    // -------------------------------------------------

    const duplicateQuestion =
      course.quizzes.some(
        (quiz) =>
          quiz.question.trim().toLowerCase() ===
          question.trim().toLowerCase()
      );

    if (duplicateQuestion) {
      return res.status(409).json({
        message:
          "A quiz question with the same text already exists.",
      });
    }

    // -------------------------------------------------
    // ADD QUESTION
    // -------------------------------------------------

    course.quizzes.push({
      question: question.trim(),
      options: cleanedOptions,
      answer: cleanAnswer,
    });

    await course.save();

    const createdQuiz =
      course.quizzes[
        course.quizzes.length - 1
      ];

    res.status(201).json({
      message:
        "Quiz question created successfully.",
      quiz: createdQuiz,
      quizzes: course.quizzes,
    });
  } catch (error) {
    console.error(
      "Add quiz question error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create quiz question.",
    });
  }
};

// =====================================================
// UPDATE QUIZ QUESTION - INSTRUCTOR
// =====================================================

const updateQuizQuestion = async (
  req,
  res
) => {
  try {
    const {
      question,
      options,
      answer,
    } = req.body;

    const result =
      await getInstructorCourse(
        req.params.courseId,
        req.user.id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          message: result.error.message,
        });
    }

    const course = result.course;

    const quiz = course.quizzes.id(
      req.params.quizId
    );

    if (!quiz) {
      return res.status(404).json({
        message:
          "Quiz question not found.",
      });
    }

    // -------------------------------------------------
    // BUILD UPDATED DATA
    // -------------------------------------------------

    const updatedQuestion =
      question !== undefined
        ? question
        : quiz.question;

    const updatedOptions =
      options !== undefined
        ? options
        : quiz.options;

    const updatedAnswer =
      answer !== undefined
        ? answer
        : quiz.answer;

    // -------------------------------------------------
    // VALIDATE COMPLETE UPDATED DATA
    // -------------------------------------------------

    const validationErrors =
      validateQuizData({
        question: updatedQuestion,
        options: updatedOptions,
        answer: updatedAnswer,
      });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors[0],
        errors: validationErrors,
      });
    }

    // -------------------------------------------------
    // DUPLICATE QUESTION CHECK
    // -------------------------------------------------

    const normalizedQuestion =
      updatedQuestion
        .trim()
        .toLowerCase();

    const duplicateQuestion =
      course.quizzes.some(
        (currentQuiz) =>
          currentQuiz._id.toString() !==
            req.params.quizId &&
          currentQuiz.question
            .trim()
            .toLowerCase() ===
            normalizedQuestion
      );

    if (duplicateQuestion) {
      return res.status(409).json({
        message:
          "Another quiz question with the same text already exists.",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    quiz.question =
      updatedQuestion.trim();

    quiz.options =
      updatedOptions.map((option) =>
        option.trim()
      );

    quiz.answer =
      updatedAnswer.trim();

    await course.save();

    res.json({
      message:
        "Quiz question updated successfully.",
      quiz,
      quizzes: course.quizzes,
    });
  } catch (error) {
    console.error(
      "Update quiz question error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update quiz question.",
    });
  }
};

// =====================================================
// DELETE QUIZ QUESTION - INSTRUCTOR
// =====================================================

const deleteQuizQuestion = async (
  req,
  res
) => {
  try {
    const result =
      await getInstructorCourse(
        req.params.courseId,
        req.user.id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          message: result.error.message,
        });
    }

    const course = result.course;

    const quiz = course.quizzes.id(
      req.params.quizId
    );

    if (!quiz) {
      return res.status(404).json({
        message:
          "Quiz question not found.",
      });
    }

    quiz.deleteOne();

    await course.save();

    res.json({
      message:
        "Quiz question deleted successfully.",
      quizzes: course.quizzes,
    });
  } catch (error) {
    console.error(
      "Delete quiz question error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to delete quiz question.",
    });
  }
};

// =====================================================
// SUBMIT QUIZ - STUDENT
// =====================================================

const submitQuiz = async (
  req,
  res
) => {
  try {
    const { answers } = req.body;
    const { courseId } = req.params;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message:
          "Answers must be provided as an array.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    const course = await Course.findById(
      courseId
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    // -------------------------------------------------
    // ENROLLMENT
    // -------------------------------------------------

    const isEnrolled =
      course.students?.some(
        (student) =>
          student.toString() ===
          req.user.id
      );

    if (!isEnrolled) {
      return res.status(403).json({
        message:
          "You are not enrolled in this course.",
      });
    }

    // -------------------------------------------------
    // QUIZ EXISTS
    // -------------------------------------------------

    if (
      !course.quizzes ||
      course.quizzes.length === 0
    ) {
      return res.status(400).json({
        message:
          "No quiz is available for this course.",
      });
    }

    let correctAnswers = 0;

    // -------------------------------------------------
    // CHECK ANSWERS
    // -------------------------------------------------

    const checkedAnswers =
      course.quizzes.map(
        (question) => {
          const submittedAnswer =
            answers.find(
              (answer) =>
                answer.questionId?.toString() ===
                question._id.toString()
            );

          const selectedAnswer =
            submittedAnswer?.selectedAnswer
              ?.trim() || "";

          const isCorrect =
            selectedAnswer ===
            question.answer;

          if (isCorrect) {
            correctAnswers++;
          }

          return {
            questionId:
              question._id,
            question:
              question.question,
            selectedAnswer,
            correctAnswer:
              question.answer,
            isCorrect,
          };
        }
      );

    const totalQuestions =
      course.quizzes.length;

    const percentage = Math.round(
      (correctAnswers /
        totalQuestions) *
        100
    );

    const status =
      percentage >= 40
        ? "Passed"
        : "Failed";

    // -------------------------------------------------
    // SAVE ATTEMPT
    // -------------------------------------------------

    const attempt =
      await QuizAttempt.create({
        student: req.user.id,
        course: courseId,
        answers: checkedAnswers,
        totalQuestions,
        correctAnswers,
        score: correctAnswers,
        percentage,
        status,
      });
      const progress = await Progress.findOneAndUpdate(
  {
    student: req.user.id,
    course: courseId,
  },
  {
    $set: {
      quizScore: percentage,
    },
  },
  {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }
);

// Calculate overall progress
const lecturePercentage =
  progress.totalLectures > 0
    ? (progress.completedLectures /
        progress.totalLectures) *
      100
    : 0;

const assignmentPercentage =
  Number(progress.assignmentMarks || 0);

const overallPercentage = Math.round(
  (lecturePercentage +
    percentage +
    assignmentPercentage) /
    3
);

progress.percentage = Math.min(
  Math.max(overallPercentage, 0),
  100
);

await progress.save();

    res.status(201).json({
      message:
        "Quiz submitted successfully.",
      result: {
        totalQuestions,
        correctAnswers,
        percentage,
        status,
      },
      attemptId: attempt._id,
    });
  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to submit quiz.",
    });
  }
};

// =====================================================
// GET QUIZ ATTEMPTS - INSTRUCTOR
// =====================================================

const getQuizAttempts = async (
  req,
  res
) => {
  try {
    const result =
      await getInstructorCourse(
        req.params.courseId,
        req.user.id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          message: result.error.message,
        });
    }

    const attempts =
      await QuizAttempt.find({
        course: req.params.courseId,
      })
        .populate(
          "student",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      count: attempts.length,
      attempts,
    });
  } catch (error) {
    console.error(
      "Get quiz attempts error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load quiz attempts.",
    });
  }
};

// =====================================================
// DELETE QUIZ ATTEMPT - INSTRUCTOR
// =====================================================

const deleteQuizAttempt = async (
  req,
  res
) => {
  try {
    const result =
      await getInstructorCourse(
        req.params.courseId,
        req.user.id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          message: result.error.message,
        });
    }

    const attempt =
      await QuizAttempt.findOne({
        _id: req.params.attemptId,
        course: req.params.courseId,
      });

    if (!attempt) {
      return res.status(404).json({
        message:
          "Quiz attempt not found.",
      });
    }

    await attempt.deleteOne();

    res.json({
      message:
        "Quiz attempt deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete quiz attempt error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to delete quiz attempt.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  submitQuiz,
  getQuizAttempts,
  deleteQuizAttempt,
};