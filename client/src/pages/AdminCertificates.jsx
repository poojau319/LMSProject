import { useEffect, useState } from "react";
import axios from "axios";

function AdminCertificates() {
  const [eligible, setEligible] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(null);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [eligibleRes, certificateRes] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/admin/certificates/eligible",
            config
          ),

          axios.get(
            "http://localhost:5000/api/admin/certificates",
            config
          ),
        ]);

      setEligible(eligibleRes.data || []);
      setCertificates(
        certificateRes.data || []
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const issueCertificate = async (
    studentId,
    courseId
  ) => {
    try {
      setIssuing(`${studentId}-${courseId}`);

      await axios.post(
        "http://localhost:5000/api/admin/certificates/issue",
        {
          studentId,
          courseId,
        },
        config
      );

      alert(
        "Certificate issued successfully 🎓"
      );

      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to issue certificate."
      );
    } finally {
      setIssuing(null);
    }
  };

  const revokeCertificate = async (id) => {
    const confirmRevoke = window.confirm(
      "Are you sure you want to revoke this certificate?"
    );

    if (!confirmRevoke) return;

    try {
      await axios.put(
        `http://localhost:5000/api/admin/certificates/${id}/revoke`,
        {},
        config
      );

      alert(
        "Certificate revoked successfully."
      );

      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to revoke certificate."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-7">

          <p className="text-sm text-blue-600 font-semibold">
            ADMINISTRATION
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Certificate Management 🎓
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Review eligible students and issue course
            completion certificates.
          </p>

        </div>


        {/* ELIGIBLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-bold text-gray-800">
              Eligible for Certificate
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Students with at least 90% course progress.
            </p>

          </div>


          {loading ? (

            <div className="p-8 text-center text-gray-500">
              Loading...
            </div>

          ) : eligible.length === 0 ? (

            <div className="p-8 text-center">

              <div className="text-3xl">
                🎓
              </div>

              <p className="font-semibold text-gray-700 mt-2">
                No eligible students
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Students will appear here after reaching
                90% progress.
              </p>

            </div>

          ) : (

            <div className="divide-y">

              {eligible.map((item) => (

                <div
                  key={`${item.student._id}-${item.course._id}`}
                  className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {item.student.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-800">
                        {item.student.name}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {item.student.email}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {item.course.title}
                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-4">

                    <span className="text-sm font-bold text-green-600">
                      {item.percentage}% Complete
                    </span>

                    {item.certificateIssued ? (

                      <span className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                        ✓ Issued
                      </span>

                    ) : (

                      <button
                        onClick={() =>
                          issueCertificate(
                            item.student._id,
                            item.course._id
                          )
                        }
                        disabled={
                          issuing ===
                          `${item.student._id}-${item.course._id}`
                        }
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:bg-gray-400"
                      >
                        {issuing ===
                        `${item.student._id}-${item.course._id}`
                          ? "Issuing..."
                          : "Issue Certificate"}
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ISSUED CERTIFICATES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-bold text-gray-800">
              Issued Certificates
            </h2>

          </div>


          {certificates.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No certificates issued yet.
            </div>

          ) : (

            <div className="divide-y">

              {certificates.map((certificate) => (

                <div
                  key={certificate._id}
                  className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      {certificate.student?.name}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {certificate.course?.title}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      ID: {certificate.certificateId}
                    </p>

                  </div>


                  <div className="flex items-center gap-3">

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        certificate.status ===
                        "Issued"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {certificate.status}
                    </span>

                    {certificate.status ===
                      "Issued" && (

                      <button
                        onClick={() =>
                          revokeCertificate(
                            certificate._id
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                      >
                        Revoke
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminCertificates;