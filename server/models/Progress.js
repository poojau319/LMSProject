const mongoose = require("mongoose");


const progressSchema = new mongoose.Schema(
{
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },


  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },


  completedLectures: {
    type: Number,
    default: 0,
    min: 0,
  },


  totalLectures: {
    type: Number,
    default: 0,
    min: 0,
  },


  assignmentMarks: {
    type: Number,
    default: 0,
    min: 0,
  },


  quizScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },


  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },


  certificateIssued: {
    type: Boolean,
    default: false,
  },

},
{
  timestamps: true,
}
);


// One student - one course = one progress record

progressSchema.index(
{
  student: 1,
  course: 1,
},
{
  unique: true,
}
);



module.exports = mongoose.model("Progress", progressSchema);