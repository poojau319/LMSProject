function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen">


      {/* Header */}

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center">

        <h1 className="text-3xl font-bold">
          Contact Us
        </h1>

        <p className="mt-3 text-blue-100">
          Have questions? We are here to help you.
        </p>

      </section>





      {/* Contact Section */}

      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">



        {/* Information */}

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">


          <h2 className="text-2xl font-bold text-gray-800">
            Get In Touch
          </h2>


          <p className="text-gray-600 mt-3">
            Contact us for course information, support and queries.
          </p>




          <div className="mt-6 space-y-5">


            <div className="flex items-center gap-4">

              <div className="text-2xl">
                📧
              </div>

              <div>
                <h3 className="font-semibold">
                  Email
                </h3>

                <p className="text-gray-600 text-sm">
                  support@learningportal.com
                </p>
              </div>

            </div>




            <div className="flex items-center gap-4">

              <div className="text-2xl">
                📞
              </div>

              <div>
                <h3 className="font-semibold">
                  Phone
                </h3>

                <p className="text-gray-600 text-sm">
                  +91 9876543210
                </p>
              </div>

            </div>





            <div className="flex items-center gap-4">

              <div className="text-2xl">
                📍
              </div>

              <div>
                <h3 className="font-semibold">
                  Location
                </h3>

                <p className="text-gray-600 text-sm">
                  India
                </p>
              </div>

            </div>


          </div>


        </div>






        {/* Form */}

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">


          <h2 className="text-2xl font-bold text-gray-800">
            Send Message
          </h2>



          <form className="mt-5 space-y-4">


            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />



            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />



            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>




            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
            >
              Send Message
            </button>


          </form>


        </div>


      </section>


    </div>
  );
}

export default Contact;