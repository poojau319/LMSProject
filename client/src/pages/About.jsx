function About() {
  return (
    <div className="bg-gray-50 min-h-screen">


      {/* Hero Section */}

<section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center">

  <h1 className="text-3xl font-bold">
    About Learning Portal
  </h1>

  <p className="mt-3 max-w-2xl mx-auto text-blue-100 text-base">
    Empowering learners with industry-ready skills through
    practical courses, expert guidance and modern technology.
  </p>

</section>




      {/* Introduction */}

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">


        <div>

          <h2 className="text-4xl font-bold text-gray-800">
            Learn. Build. Grow.
          </h2>

          <p className="mt-4 text-gray-600 leading-8">
            Learning Portal is a modern Learning Management System
            designed to help students learn technical skills and
            prepare for real-world opportunities.
          </p>


          <p className="mt-4 text-gray-600 leading-8">
            Our platform provides courses in Web Development,
            Data Science, Artificial Intelligence, Cloud Computing
            and other emerging technologies.
          </p>

        </div>




        <div className="bg-white rounded-2xl shadow-lg p-8 border">


          <div className="text-5xl mb-4">
            🎯
          </div>


          <h3 className="text-2xl font-bold text-gray-800">
            Our Mission
          </h3>


          <p className="mt-3 text-gray-600 leading-7">
            To provide accessible and practical education that
            helps learners build successful careers with
            industry-focused skills.
          </p>


        </div>


      </section>






      {/* Stats */}

      <section className="max-w-7xl mx-auto px-6 pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">


        {
          [
            ["👨‍🎓","10K+","Students"],
            ["📚","50+","Courses"],
            ["👨‍🏫","100+","Mentors"],
            ["🏆","95%","Success Rate"]

          ].map((item,index)=>(

            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
            >

              <div className="text-4xl">
                {item[0]}
              </div>

              <h3 className="text-3xl font-bold text-blue-600 mt-3">
                {item[1]}
              </h3>

              <p className="text-gray-600 mt-1">
                {item[2]}
              </p>


            </div>

          ))
        }


      </section>







      {/* Features */}

      <section className="bg-white py-16 px-6">


        <h2 className="text-4xl font-bold text-center text-gray-800">
          Why Choose Learning Portal?
        </h2>



        <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-3 gap-6">


          {
            [
              {
                icon:"🎯",
                title:"Career Focused",
                desc:"Courses designed according to current industry requirements."
              },

              {
                icon:"💻",
                title:"Practical Learning",
                desc:"Gain experience through projects and hands-on practice."
              },

              {
                icon:"🚀",
                title:"Future Ready",
                desc:"Learn technologies that help you grow professionally."
              }

            ].map((feature,index)=>(


              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >

                <div className="text-4xl">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mt-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mt-2">
                  {feature.desc}
                </p>


              </div>


            ))
          }


        </div>


      </section>



    </div>
  );
}

export default About;