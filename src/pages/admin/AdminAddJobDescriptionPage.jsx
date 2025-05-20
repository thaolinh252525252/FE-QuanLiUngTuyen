import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

function AdminAddJobDescriptionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      vi_tri: title,
      mo_ta: description,
      yeu_cau: requirements,
      han_nop: deadline,
    };

    fetch(import.meta.env.VITE_BACKEND_URL + "/job-descriptions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("✅ Đã thêm mô tả công việc mới");
        setTitle("");
        setDescription("");
        setRequirements("");
        setDeadline("");
        navigate("/admin/job-descriptions");
      })
      .catch((err) => {
        console.error("❌ Lỗi khi thêm JD:", err);
        alert("❌ Không thể thêm mô tả công việc.");
      });
  };

  return (
    <AdminLayout>
      <div className="admin-card shadow-sm p-4">
        <h2 className="mb-4 text-primary">
          <i className="bi bi-file-earmark-plus me-2"></i>
          Thêm Mô tả Công việc
        </h2>

        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          <div className="mb-3">
            <label htmlFor="title" className="form-label fw-semibold text-primary">
              Vị trí tuyển dụng <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-control shadow-sm"
              placeholder="Nhập vị trí tuyển dụng"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-semibold text-primary">
              Mô tả công việc <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              className="form-control shadow-sm"
              rows="5"
              placeholder="Nhập mô tả công việc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="requirements" className="form-label fw-semibold text-primary">
              Yêu cầu công việc <span className="text-danger">*</span>
            </label>
            <textarea
              id="requirements"
              className="form-control shadow-sm"
              rows="4"
              placeholder="Nhập yêu cầu công việc"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="deadline" className="form-label fw-semibold text-primary">
              Hạn nộp hồ sơ <span className="text-danger">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              className="form-control shadow-sm"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary shadow-sm"
              onClick={() => navigate("/admin/job-descriptions")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </button>

            <button type="submit" className="btn btn-primary shadow-sm px-4">
              <i className="bi bi-plus-circle me-2"></i>
              Thêm Mô tả
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminAddJobDescriptionPage;
