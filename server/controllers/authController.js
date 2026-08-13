const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../middleware/generateToken");


// ================= REGISTER USER =================

const registerUser = async (req, res) => {

  try {

    const { name, email, password, role } = req.body;


    const userExists = await User.findOne({ email });


    if (userExists) {

      return res.status(400).json({

        message: "User already exists",

      });

    }


    const hashedPassword = await bcrypt.hash(password, 10);



    const user = await User.create({

      name,

      email,

      password: hashedPassword,

      role: role || "student",

    });



    res.status(201).json({

      _id: user._id,

      name: user.name,

      email: user.email,

      role: user.role,

      token: generateToken(user._id, user.role),

    });



  } catch(error) {

    res.status(500).json({

      message:error.message,

    });

  }

};





// ================= LOGIN USER =================

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;



    const user = await User.findOne({ email }).select("+password");



    if(!user){

      return res.status(401).json({

        message:"Invalid email or password",

      });

    }



    const passwordMatch = await bcrypt.compare(

      password,

      user.password

    );



    if(!passwordMatch){

      return res.status(401).json({

        message:"Invalid email or password",

      });

    }



    res.json({

      _id:user._id,

      name:user.name,

      email:user.email,

      role:user.role,

      token:generateToken(user._id, user.role),

    });



  } catch(error){

    res.status(500).json({

      message:error.message,

    });

  }

};






// ================= GET USER PROFILE =================

const getUserProfile = async(req,res)=>{

  try {


    const user = await User.findById(req.user.id)

      .populate("enrolledCourses");



    if(!user){

      return res.status(404).json({

        message:"User not found",

      });

    }



    res.json(user);



  } catch(error){


    res.status(500).json({

      message:error.message,

    });


  }

};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    res.json({
      message: "Password reset successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
};