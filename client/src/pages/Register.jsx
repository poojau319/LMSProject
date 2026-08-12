import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleRegister = async (e) => {

    e.preventDefault();


    if (!name || !email || !password || !confirmPassword) {

      alert("Please fill all fields ❌");
      return;

    }


    if (password !== confirmPassword) {

      alert("Passwords do not match ❌");
      return;

    }



    try {

      const res = await axios.post(

        "http://localhost:5000/api/auth/register",

        {
          name,
          email,
          password,
          role,
        }

      );


      alert("Registration Successful ✅");

      console.log(res.data);

      navigate("/login");


    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 px-4">


      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">


        <div className="text-center mb-5">

          <div className="text-4xl mb-2">
            🎓
          </div>


          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>


          <p className="text-sm text-gray-500 mt-1">
            Start your learning journey with us.
          </p>


        </div>




        <form onSubmit={handleRegister} className="space-y-3">



          <input

            type="text"

            placeholder="Full Name"

            className="w-full border rounded-lg px-4 py-2.5"

            value={name}

            onChange={(e)=>setName(e.target.value)}

          />




          <input

            type="email"

            placeholder="Email Address"

            className="w-full border rounded-lg px-4 py-2.5"

            value={email}

            onChange={(e)=>setEmail(e.target.value)}

          />





          <div className="relative">

            <input

              type={showPassword ? "text" : "password"}

              placeholder="Password"

              className="w-full border rounded-lg px-4 py-2.5 pr-12"

              value={password}

              onChange={(e)=>setPassword(e.target.value)}

            />


            <button

              type="button"

              onClick={()=>setShowPassword(!showPassword)}

              className="absolute right-3 top-2.5"

            >

              {showPassword ? "🙈" : "👁️"}

            </button>


          </div>





          <div className="relative">

            <input

              type={showConfirmPassword ? "text" : "password"}

              placeholder="Confirm Password"

              className="w-full border rounded-lg px-4 py-2.5 pr-12"

              value={confirmPassword}

              onChange={(e)=>setConfirmPassword(e.target.value)}

            />


            <button

              type="button"

              onClick={()=>setShowConfirmPassword(!showConfirmPassword)}

              className="absolute right-3 top-2.5"

            >

              {showConfirmPassword ? "🙈" : "👁️"}

            </button>


          </div>





          {/* Role Selection */}

          <select

            className="w-full border rounded-lg px-4 py-2.5"

            value={role}

            onChange={(e)=>setRole(e.target.value)}

          >

            <option value="student">
              Student
            </option>


            <option value="instructor">
              Instructor
            </option>


            <option value="admin">
              Admin
            </option>


          </select>





          <button

            type="submit"

            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold"

          >

            Create Account

          </button>



        </form>





        <p className="text-center text-sm text-gray-600 mt-5">

          Already have an account?{" "}


          <Link

            to="/login"

            className="text-indigo-600 font-semibold"

          >

            Login

          </Link>


        </p>



      </div>


    </div>

  );

}


export default Register;