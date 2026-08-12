import { useEffect, useState } from "react";
import axios from "axios";

function MyCertificates() {
  const [certificates, setCertificates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/certificates/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCertificates(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const downloadCertificate = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/certificates/download/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [res.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "Learning-Portal-Certificate.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to download certificate."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-6xl mx-auto">

        <div className="mb-7">

          <p className="text-sm text-blue-600 font-semibold">
            MY ACHIEVEMENTS
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            My Certificates 🏆
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            View and download your earned course
            certificates.
          </p>

        </div>


        {loading ? (

          <div className="bg-white rounded-xl p-8 text-center">
            Loading certificates...
          </div>

        ) : certificates.length === 0 ? (

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">

            <div className="text-5xl">
              🎓
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-4">
              No Certificates Yet
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Complete your courses and earn certificates.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {certificates.map(
              (certificate) => {

                const issueDate =
                  new Date(
                    certificate.issueDate
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                return (
                  <div
                    key={certificate._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                  >

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">

                      <div className="flex justify-between items-start">

                        <div className="text-3xl">
                          🏆
                        </div>

                        <span className="bg-white/15 px-3 py-1 rounded-full text-xs">
                          Certified
                        </span>

                      </div>

                      <p className="text-blue-100 text-xs mt-6">
                        CERTIFICATE OF COMPLETION
                      </p>

                      <h2 className="font-bold text-xl mt-1">
                        {certificate.course?.title}
                      </h2>

                    </div>


                    <div className="p-5">

                      <p className="text-xs text-gray-500">
                        Certificate ID
                      </p>

                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {certificate.certificateId}
                      </p>

                      <div className="flex justify-between mt-4">

                        <div>
                          <p className="text-xs text-gray-400">
                            Issued
                          </p>

                          <p className="text-sm font-medium text-gray-700">
                            {issueDate}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            Status
                          </p>

                          <p className="text-sm font-semibold text-green-600">
                            ✓ Valid
                          </p>
                        </div>

                      </div>


                      <button
                        onClick={() =>
                          downloadCertificate(
                            certificate._id
                          )
                        }
                        className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                      >
                        Download Certificate ↓
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyCertificates;