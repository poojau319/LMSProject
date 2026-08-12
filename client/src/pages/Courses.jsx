import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Courses() {

  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);


  useEffect(() => {

    const fetchCourses = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/api/courses"
        );

        console.log(res.data);

        setCourses(res.data);


      } catch (error) {

        console.log(error);

      }

    };


    fetchCourses();

  }, []);





  const enrollCourse = async (courseId) => {

    const token = localStorage.getItem("token");


    if (!token) {

      alert("Please login first");

      return;

    }



    try {


      const res = await axios.post(

        `http://localhost:5000/api/courses/enroll/${courseId}`,

        {},

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );


      alert(res.data.message);



    } catch (error) {


      alert(
        error.response?.data?.message ||
        "Enrollment Failed"
      );


    }

  };





  const filteredCourses = courses.filter((course) =>

    course.title
      .toLowerCase()
      .includes(search.toLowerCase())

  );





  return (

    <div className="bg-gray-50 min-h-screen p-8">


      <div className="text-center mb-10">


        <h1 className="text-4xl font-bold text-gray-800">

          Explore Our Courses

        </h1>


        <p className="text-gray-600 mt-3">

          Learn industry-ready skills from our professional courses.

        </p>


      </div>





      <div className="max-w-xl mx-auto mb-8">


        <input

          type="text"

          placeholder="🔍 Search courses..."

          className="w-full px-5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

        />


      </div>





      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">



        {

          filteredCourses.map((course)=>(


            <div

              key={course._id}

              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"

            >



              <div className="bg-blue-100 py-5 text-center text-4xl">

                📚

              </div>





              <div className="p-5">


                <h2 className="text-xl font-bold text-gray-800">

                  {course.title}

                </h2>




                <p className="text-sm text-gray-600 mt-2">

                  {course.description}

                </p>





                <div className="flex justify-between mt-4 text-sm">


                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">

                    {course.duration}

                  </span>



                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">

                    {course.level}

                  </span>


                </div>





                <div className="flex justify-between mt-4 text-sm text-gray-600">


                  <span>

                    ⭐ {course.rating || 0}

                  </span>




                  <span>

                    👥 {course.totalStudents || 0} Students

                  </span>


                </div>

                <div className="mt-4">
  <span className="text-2xl font-bold text-gray-800">
    ₹{course.price || 0}
  </span>
</div>





                <Link

                  to={`/course-details/${course._id}`}

                  className="block mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl transition"

                >

                  View Details

                </Link>





                <button

                  onClick={() => enrollCourse(course._id)}

                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"

                >

                  Enroll Now

                </button>





              </div>


            </div>


          ))

        }



      </div>



    </div>

  );

}


export default Courses;