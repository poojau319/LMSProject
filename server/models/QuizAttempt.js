const mongoose = require("mongoose");

const quizAnswerSchema =
  new mongoose.Schema(
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      question: {
        type: String,
        required: true,
      },

      selectedAnswer: {
        type: String,
        default: "",
      },

      correctAnswer: {
        type: String,
        required: true,
      },

      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );

const quizAttemptSchema =
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
      },

      answers: {
        type: [quizAnswerSchema],
        default: [],
      },

      totalQuestions: {
        type: Number,
        default: 0,
        min: 0,
      },

      correctAnswers: {
        type: Number,
        default: 0,
        min: 0,
      },

      score: {
        type: Number,
        default: 0,
        min: 0,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      status: {
        type: String,
        enum: ["Passed", "Failed"],
        default: "Failed",
      },
    },
    {
      timestamps: true,
    }
  );


module.exports = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);