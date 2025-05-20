import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error("Lỗi tải chi tiết job:", err));
  }, [id]);

  if (!job) return <p style={{ padding: "20px" }}>Đang tải...</p>;

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "20px" }}>
        <h2>{job.vi_tri}</h2>
        <p><strong>Hạn nộp:</strong> {new Date(job.han_nop).toLocaleDateString("vi-VN")}</p>
        <h4>Mô tả công việc</h4>
        <p>{job.mo_ta}</p>
        <h4>Yêu cầu</h4>
        <p>{job.yeu_cau}</p>
        <Link to="/" style={{ marginTop: "20px", display: "inline-block", color: "#007bff" }}>← Quay lại trang chủ</Link>
      </div>
      <Footer />
    </>
  );
}

export default JobDetailPage;
