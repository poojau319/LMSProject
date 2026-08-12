const Course = require("../models/Course");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Purchase = require("../models/Purchase");


// ================= GET ALL COURSES =================

const getCourses = async (req, res) => {

try {

  const courses = await Course.find({
    status: "Approved",
  });


  res.json(courses);


} catch(error) {

  res.status(500).json({
    message:error.message,
  });

}

};



// ================= GET SINGLE COURSE =================

const getCourseById = async(req,res)=>{

try {

  const course = await Course.findById(req.params.id)
    .populate("instructor", "name email");


  if(!course){

    return res.status(404).json({
      message:"Course not found",
    });

  }


  res.json(course);


}catch(error){

  res.status(500).json({
    message:error.message,
  });

}

};



// ================= ADD LECTURE =================

const addLecture = async(req,res)=>{

try{

  const course = await Course.findById(req.params.id);


  if(!course){

    return res.status(404).json({
      message:"Course not found",
    });

  }


  // Instructor check

  if(course.instructor.toString() !== req.user.id){

    return res.status(403).json({
      message:"Access Denied",
    });

  }


  course.lectures.push(req.body);


  await course.save();


  res.json({

    message:"Lecture Added Successfully ✅",

    course,

  });


}catch(error){

  res.status(500).json({
    message:error.message,
  });

}

};



// ================= ENROLL COURSE =================

const enrollCourse = async(req,res)=>{

try{

  const user = await User.findById(req.user.id);


  if(!user){

    return res.status(404).json({
      message:"User not found",
    });

  }


  const course = await Course.findById(req.params.id);



  if(!course){

    return res.status(404).json({
      message:"Course not found",
    });

  }



  if(user.enrolledCourses.includes(course._id)){


    return res.status(400).json({

      message:"Already enrolled in this course",

    });


  }



  user.enrolledCourses.push(course._id);


  course.students.push(user._id);


  course.totalStudents = course.students.length;



  await user.save();

  await course.save();


await Purchase.create({
  student: user._id,
  course: course._id,
  amount: course.price,
  status: "Paid",
  paymentMethod: "Demo Payment",
  transactionId: `DEMO-${Date.now()}`,
});

  // Create progress record

  await Progress.create({

    student:user._id,

    course:course._id,

    totalLectures:course.lectures.length,

  });



  res.json({

    message:"Course Enrolled Successfully ✅",

  });



}catch(error){

  res.status(500).json({

    message:error.message,

  });

}

};



// ================= GET MY COURSES =================

const getMyCourses = async(req,res)=>{

try{

  const user = await User.findById(req.user.id)

    .populate("enrolledCourses");



  res.json(user.enrolledCourses);


}catch(error){

  res.status(500).json({

    message:error.message,

  });

}

};



// ================= GET STUDENT PROGRESS =================

const getProgress = async(req,res)=>{

try{

  const progress = await Progress.find({

    student:req.user.id,

  })

  .populate("course");



  const result = progress.map(item=>({


    courseName:item.course.title,

    completedLectures:item.completedLectures,

    totalLectures:item.totalLectures,

    quizScore:item.quizScore,

    assignmentMarks:item.assignmentMarks,

    percentage:item.percentage,

    certificateIssued:item.certificateIssued,


  }));



  res.json(result);



}catch(error){

  res.status(500).json({

    message:error.message,

  });

}

};



module.exports = {

getCourses,

getCourseById,

addLecture,

enrollCourse,

getMyCourses,

getProgress,

};