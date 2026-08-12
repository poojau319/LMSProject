const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:true,
  },


  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
  },


  password:{
    type:String,
    required:true,
    minlength:6,
    select:false,
  },


  role:{
    type:String,
    enum:[
      "student",
      "instructor",
      "admin"
    ],
    default:"student",
  },


  enrolledCourses:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Course",
    }
  ],

},
{
  timestamps:true,
}
);


module.exports = mongoose.model("User", userSchema);