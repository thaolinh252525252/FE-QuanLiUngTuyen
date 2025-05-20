import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

function AdminAddCandidatePage() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL + "/candidates/";

  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    vi_tri_ung_tuyen: "",
    ngay_sinh: "",
    que_quan: "",
    noi_o: ""
  });

  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) submitData.append(key, formData[key]);
      });
      if (cvFile) submitData.append("cv_file", cvFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: submitData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Thêm ứng viên thành công:", result);

      setSuccess(true);
      setFormData({
        ho_ten: "",
        email: "",
        so_dien_thoai: "",
        vi_tri_ung_tuyen: "",
        ngay_sinh: "",
        que_quan: "",
        noi_o: ""
      });
      setCvFile(null);
      document.getElementById("cv-file-input").value = "";

      setTimeout(() => navigate("/admin/candidates"), 2000);
    } catch (err) {
      console.error("❌ Lỗi khi thêm ứng viên:", err);
      setError(err.message || "Không thể thêm ứng viên.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card shadow-sm p-4">
        <h2 className="mb-4 text-primary">
          <i className="bi bi-person-plus-fill me-2"></i>
          Thêm Ứng Viên Mới
        </h2>

        {success && (
          <div className="alert alert-success d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2 fs-4"></i>
            <div>Thêm ứng viên thành công! Đang chuyển hướng...</div>
          </div>
        )}
        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          <div className="border rounded bg-white p-4 mb-4 shadow-sm">
            <h5 className="mb-3 fw-semibold text-primary">
              <i className="bi bi-person-lines-fill me-2"></i>Thông tin cá nhân
            </h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label htmlFor="ho_ten" className="form-label fw-semibold">Họ tên</label>
                <input
                  type="text"
                  id="ho_ten"
                  name="ho_ten"
                  className="form-control form-control-lg shadow-sm"
                  placeholder="Nhập họ tên"
                  value={formData.ho_ten}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="email" className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control form-control-lg shadow-sm"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="so_dien_thoai" className="form-label fw-semibold">Số điện thoại</label>
                <input
                  type="text"
                  id="so_dien_thoai"
                  name="so_dien_thoai"
                  className="form-control form-control-lg shadow-sm"
                  placeholder="Nhập số điện thoại"
                  value={formData.so_dien_thoai}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="vi_tri_ung_tuyen" className="form-label fw-semibold">Vị trí ứng tuyển</label>
                <input
                  type="text"
                  id="vi_tri_ung_tuyen"
                  name="vi_tri_ung_tuyen"
                  className="form-control form-control-lg shadow-sm"
                  placeholder="VD: Lập trình viên"
                  value={formData.vi_tri_ung_tuyen}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="ngay_sinh" className="form-label fw-semibold">Ngày sinh</label>
                <input
                  type="date"
                  id="ngay_sinh"
                  name="ngay_sinh"
                  className="form-control form-control-lg shadow-sm"
                  value={formData.ngay_sinh}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="que_quan" className="form-label fw-semibold">Quê quán</label>
                <input
                  type="text"
                  id="que_quan"
                  name="que_quan"
                  className="form-control form-control-lg shadow-sm"
                  value={formData.que_quan}
                  onChange={handleChange}
                  placeholder="VD: Hà Nội"
                />
              </div>

              <div className="col-12">
                <label htmlFor="noi_o" className="form-label fw-semibold">Nơi ở hiện tại</label>
                <input
                  type="text"
                  id="noi_o"
                  name="noi_o"
                  className="form-control form-control-lg shadow-sm"
                  value={formData.noi_o}
                  onChange={handleChange}
                  placeholder="VD: Quận 1, TP.HCM"
                />
              </div>
            </div>
          </div>

          <div className="border rounded bg-white p-4 mb-4 shadow-sm">
            <h5 className="mb-3 fw-semibold text-primary">
              <i className="bi bi-paperclip me-2"></i>File CV
            </h5>
            <input
              type="file"
              className="form-control form-control-lg shadow-sm"
              id="cv-file-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <div className="form-text">Chấp nhận .pdf, .doc, .docx. Dung lượng tối đa 5MB.</div>
          </div>

          <div className="d-flex justify-content-end gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary shadow-sm"
              onClick={() => navigate("/admin/candidates")}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-1"></i> Quay lại
            </button>
            <button type="submit" className="btn btn-primary shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1" /> Thêm ứng viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminAddCandidatePage;
