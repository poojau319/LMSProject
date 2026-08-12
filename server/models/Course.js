const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
  },


  description: {
    type: String,
    required: true,
  },


  duration: {
    type: String,
    required: true,
  },


  level: {
    type: String,
    required: true,
  },


  image: {
    type: String,
    default: "",
  },

  price: {
  type: Number,
  required: true,
  default: 0,
  min: 0,
},

  // Course Creator (Instructor)

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },


  // Enrolled Students

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],


  // Course Lectures

  lectures: [
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    youtubeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },
  },
],


  // Course Quizzes

quizzes: [
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options) {
          return options.length === 4;
        },
        message: "Exactly 4 quiz options are required.",
      },
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
],


  // Course Approval Status

  status: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Rejected"
    ],
    default: "Pending",
  },


  // Course Rating

  rating: {
    type: Number,
    default: 0,
  },

    // Total Students Count

  totalStudents: {
    type: Number,
    default: 0,
  },


},
{
  timestamps: true,
}
);


module.exports = mongoose.model("Course", courseSchema);