const Feedback = require("../models/Feedback");



// ================= ADD FEEDBACK =================

const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // ================= VALIDATE RATING =================

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5 stars.",
      });
    }

    // ================= VALIDATE COMMENT =================

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Please write your feedback.",
      });
    }

    // ================= CHECK COMMENT LENGTH =================

    if (comment.trim().length < 5) {
      return res.status(400).json({
        message: "Feedback must contain at least 5 characters.",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        message: "Feedback cannot exceed 1000 characters.",
      });
    }

    // ================= CHECK EXISTING FEEDBACK =================

    const existingFeedback = await Feedback.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You already submitted feedback for this course.",
      });
    }

    // ================= CREATE FEEDBACK =================

    const feedback = await Feedback.create({
      student: req.user.id,
      course: req.params.courseId,
      rating: numericRating,
      comment: comment.trim(),
    });

    res.status(201).json({
      message: "Feedback Added Successfully ✅",
      feedback,
    });
  } catch (error) {
    console.error("Add feedback error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};



// ================= GET COURSE FEEDBACK =================

const getCourseFeedback = async(req,res)=>{

try{


const feedback = await Feedback.find({

  course:req.params.courseId,

})

.populate("student","name");



res.json(feedback);



}catch(error){

res.status(500).json({

  message:error.message,

});

}

};






module.exports = {

addFeedback,

getCourseFeedback,

};