import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Lỗi tải danh sách jobs:", err));
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.vi_tri.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="section-title">Danh sách việc làm</h2>

        <input
          type="text"
          placeholder="Tìm kiếm vị trí..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", width: "100%", marginBottom: "20px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <div className="job-grid">
          {filteredJobs.map((job) => (
            job.id ? (  // 👈 Bảo vệ nếu job.id không tồn tại
              <div key={job.id} className="job-card" style={{
                padding: "16px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "16px",
                backgroundColor: "#fff"
              }}>
                <h3>{job.vi_tri}</h3>
                <p><strong>Hạn nộp:</strong> {new Date(job.han_nop).toLocaleDateString("vi-VN")}</p>

                <Link to={`/jobs/${job.id}`} className="btn-primary" style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: "4px",
                  textDecoration: "none"
                }}>
                  Xem chi tiết
                </Link>
              </div>
            ) : null
          ))}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
