import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function CourseDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);


  const enrollCourse = async () => {

    const token = localStorage.getItem("token");


    if (!token) {

      alert("Please login first");
      navigate("/login");
      return;

    }


    try {

      const res = await axios.post(
        `https://lmsproject-ntug.onrender.com/api/courses/enroll/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      alert(res.data.message);


    } catch(error) {

      alert(
        error.response?.data?.message || "Enrollment Failed"
      );

    }

  };



  useEffect(() => {

    const fetchCourse = async () => {

      try {

        const res = await axios.get(
          `https://lmsproject-ntug.onrender.com/api/courses/${id}`
        );

        setCourse(res.data);

      } catch(error) {

        console.log(error);

      }

    };


    fetchCourse();

  }, [id]);



  if(!course){

    return (
      <h2 className="text-center mt-10 text-xl">
        Loading...
      </h2>
    );

  }



  return (

    <div className="bg-gray-50 min-h-screen">


      {/* Header */}

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-4xl font-bold">
            {course.title}
          </h1>


          <p className="mt-4">
            {course.description}
          </p>


          <div className="flex gap-6 mt-6 text-sm">

            <span>⭐ 4.8 Rating</span>
            <span>👨‍🎓 Students</span>
            <span>⏳ {course.duration}</span>

          </div>


        </div>

      </section>





      <section className="max-w-6xl mx-auto py-12 px-6 grid md:grid-cols-3 gap-8">


        {/* Left Side */}

        <div className="md:col-span-2">



          {/* Description */}

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold">
              Course Description
            </h2>


            <p className="mt-4">
              {course.description}
            </p>

          </div>





          {/* Video Lectures */}

          <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold">
              Video Lectures 🎥
            </h2>


            {

              course.lectures?.length > 0 ?

              course.lectures.map((lecture,index)=>(

                <div key={index} className="border p-4 mt-4 rounded">


                  <h3 className="font-bold">
                    {index+1}. {lecture.title}
                  </h3>


                  <p>
                    Duration: {lecture.duration}
                  </p>


                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    className="text-blue-600"
                  >
                    Watch Video
                  </a>


                </div>

              ))

              :

              <p className="mt-4 text-gray-500">
                No lectures available yet
              </p>

            }


          </div>





          {/* Assignments */}

          <div className="bg-white rounded-xl shadow p-6 mt-6">


            <h2 className="text-2xl font-bold">
              Assignments 📄
            </h2>


            {

              course.assignments?.length > 0 ?

              course.assignments.map((assignment,index)=>(

                <div key={index} className="border p-4 mt-4 rounded">


                  <h3 className="font-bold">
                    {index+1}. {assignment.title}
                  </h3>


                  <p>
                    {assignment.description}
                  </p>


                  <p>
                    Due Date: {assignment.dueDate}
                  </p>


                </div>

              ))

              :

              <p className="mt-4 text-gray-500">
                No assignments available yet
              </p>

            }


          </div>






          {/* Quiz */}

          <div className="bg-white rounded-xl shadow p-6 mt-6">


            <h2 className="text-2xl font-bold">
              Quizzes 📝
            </h2>


            {

              course.quizzes?.length > 0 ?

              course.quizzes.map((quiz,index)=>(

                <div key={index} className="border p-4 mt-4 rounded">


                  <h3 className="font-bold">
                    Q{index+1}. {quiz.question}
                  </h3>


                  <ul className="mt-3">

                    {
                      quiz.options.map((option,i)=>(

                        <li key={i}>
                          ○ {option}
                        </li>

                      ))
                    }

                  </ul>


                </div>


              ))

              :

              <p className="mt-4 text-gray-500">
                No quizzes available yet
              </p>

            }


          </div>




        </div>






        {/* Right Side */}

        <div>

          <div className="bg-white rounded-xl shadow p-6">


            <h2 className="text-2xl font-bold">
              Course Details
            </h2>


            <p className="mt-4">
              <b>Duration:</b> {course.duration}
            </p>


            <p className="mt-3">
              <b>Level:</b> {course.level}
            </p>

            <p className="mt-4 text-2xl font-bold text-green-600">
  ₹{course.price || 0}
</p>



            <button
              onClick={enrollCourse}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded"
            >
              Enroll Now
            </button>


          </div>

        </div>



      </section>


    </div>

  );

}


export default CourseDetails;