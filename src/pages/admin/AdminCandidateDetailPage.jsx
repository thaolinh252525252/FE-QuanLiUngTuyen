import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

function AdminCandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Không thể tải thông tin ứng viên");
        return res.json();
      })
      .then(data => {
        // Chuẩn hóa dữ liệu
        setCandidate({
          id: data.id || data._id || "",
          ho_ten: data.ho_ten || "Không có thông tin",
          email: data.email || "Không có thông tin",
          so_dien_thoai: data.so_dien_thoai || "Không có thông tin",
          ngay_sinh: data.ngay_sinh || "Không có thông tin",
          que_quan: data.que_quan || "Không có thông tin",
          noi_o: data.noi_o || "Không có thông tin",
          vi_tri_ung_tuyen: data.vi_tri_ung_tuyen || "Không có thông tin",
          trinh_do_hoc_van: Array.isArray(data.trinh_do_hoc_van) ? data.trinh_do_hoc_van : [],
          kinh_nghiem: Array.isArray(data.kinh_nghiem) ? data.kinh_nghiem : [],
          ky_nang: Array.isArray(data.ky_nang) ? data.ky_nang : [],
          chung_chi: Array.isArray(data.chung_chi) ? data.chung_chi : [],
          giai_thuong: Array.isArray(data.giai_thuong) ? data.giai_thuong : [],
          du_an: Array.isArray(data.du_an) ? data.du_an : [],
          trang_thai: data.trang_thai || "",
          diem_phu_hop: data.diem_phu_hop || 0,
          lich_phong_van: data.lich_phong_van ? {
            ngay: data.lich_phong_van.ngay || "Chưa có thông tin",
            gio: data.lich_phong_van.gio || "Chưa có thông tin",
            dia_diem: data.lich_phong_van.dia_diem || "Chưa có thông tin",
            trang_thai: data.lich_phong_van.trang_thai || "Đã lên lịch"
          } : null,
          nhan_xet: data.nhan_xet || "",
          ghi_chu: data.ghi_chu || "",
          cv_filepath: data.cv_filepath || ""
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu ứng viên:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const formatHocVan = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "Không có thông tin";
    return arr.map((e) => {
      if (typeof e === "string") return e;
      return `${e.ten_truong || ""} - ${e.chuyen_nganh || ""} (${e.nam_tot_nghiep || ""})`;
    }).join(", ");
  };

  const formatKinhNghiem = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "Không có thông tin";
    return arr.map((e) => {
      if (typeof e === "string") return e;
      return `${e.chuc_vu || ""} tại ${e.cong_ty || ""} (${e.thoi_gian || ""})`;
    });
  };

  const formatList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return ["Không có thông tin"];
    return arr.map(item => typeof item === "string" ? item : JSON.stringify(item));
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge bg-secondary">Chưa đánh giá</span>;
    if (status === "Pass") return <span className="badge bg-success fw-bold">Pass</span>;
    if (status === "Fail CV") return <span className="badge bg-danger fw-bold">Fail CV</span>;
    if (status === "Fail Interview") return <span className="badge bg-warning text-dark fw-bold">Fail Interview</span>;
    return <span className="badge bg-info">{status}</span>;
  };

  const downloadCV = () => {
    if (!candidate || !candidate.cv_filepath) return;

    const downloadUrl = `${import.meta.env.VITE_BACKEND_URL}/${candidate.cv_filepath}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `CV_${candidate.ho_ten || id}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-card d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !candidate) {
    return (
      <AdminLayout>
        <div className="admin-card">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Có lỗi xảy ra!</h4>
            <p>{error || "Không thể tải thông tin ứng viên"}</p>
            <hr />
            <button className="btn btn-primary" onClick={() => navigate("/admin/candidates")}>
              <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách ứng viên
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-card candidate-detail-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title">
            <i className="bi bi-person-vcard me-2"></i>
            Chi Tiết Ứng Viên
          </h2>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/admin/candidates")}>
            <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách
          </button>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4 candidate-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="bi bi-person-lines-fill me-2"></i>Thông tin cá nhân</h5>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Họ tên:</div>
                  <div className="col-md-8">{candidate.ho_ten}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Email:</div>
                  <div className="col-md-8">{candidate.email}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Số điện thoại:</div>
                  <div className="col-md-8">{candidate.so_dien_thoai}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Ngày sinh:</div>
                  <div className="col-md-8">{candidate.ngay_sinh}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Quê quán:</div>
                  <div className="col-md-8">{candidate.que_quan}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Nơi ở hiện tại:</div>
                  <div className="col-md-8">{candidate.noi_o}</div>
                </div>
              </div>
            </div>

            <div className="card mb-4 candidate-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="bi bi-mortarboard-fill me-2"></i>Thông tin học vấn & kinh nghiệm</h5>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Vị trí ứng tuyển:</div>
                  <div className="col-md-8 fw-semibold text-primary">{candidate.vi_tri_ung_tuyen}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Trình độ học vấn:</div>
                  <div className="col-md-8">{formatHocVan(candidate.trinh_do_hoc_van)}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Kinh nghiệm làm việc:</div>
                  <ul className="col-md-8">
                    {formatKinhNghiem(candidate.kinh_nghiem).map((item, index) => (
                      <li key={index} className="text-base normal-case">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Kỹ năng:</div>
                  <div className="col-md-8">
                    {candidate.ky_nang.length > 0 ? (
                      <div className="d-flex flex-wrap">
                        {candidate.ky_nang.map((skill, index) => (
                          <span key={index} className="skill-badge">
                            <i className="bi bi-check-circle me-1 text-success"></i>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "Không có thông tin"
                    )}
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Chứng chỉ:</div>
                  <ul className="col-md-8">
                    {formatList(candidate.chung_chi).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Giải thưởng:</div>
                  <ul className="col-md-8">
                    {formatList(candidate.giai_thuong).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold">Dự án:</div>
                  <ul className="col-md-8">
                    {formatList(candidate.du_an).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {candidate.ghi_chu && (
              <div className="card mb-4 candidate-card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0"><i className="bi bi-journal-text me-2"></i>Ghi chú</h5>
                </div>
                <div className="card-body">
                  <p className="mb-0 note-content">{candidate.ghi_chu}</p>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card mb-4 candidate-card status-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="bi bi-clipboard-data me-2"></i>Trạng thái ứng viên</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="fw-bold mb-2">Trạng thái:</div>
                  <div>{getStatusBadge(candidate.trang_thai)}</div>
                </div>
                <div className="mb-4">
                  <div className="fw-bold mb-2">Điểm phù hợp:</div>
                  <div className="d-flex align-items-center">
                    <div className="progress flex-grow-1" style={{ height: "20px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${candidate.diem_phu_hop}%` }}
                        aria-valuenow={candidate.diem_phu_hop}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className="ms-2 fw-bold">{candidate.diem_phu_hop}%</span>
                  </div>
                </div>
                {candidate.lich_phong_van && (
                  <div className="mb-4">
                    <div className="fw-bold mb-2">Lịch phỏng vấn:</div>
                    <div className="interview-schedule p-3">
                      <div className="schedule-item mb-2">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        {candidate.lich_phong_van.ngay}
                      </div>
                      <div className="schedule-item mb-2">
                        <i className="bi bi-clock me-2 text-primary"></i>
                        {candidate.lich_phong_van.gio}
                      </div>
                      <div className="schedule-item mb-2">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        {candidate.lich_phong_van.dia_diem}
                      </div>
                      <div className="schedule-item">
                        <i className="bi bi-info-circle me-2 text-primary"></i>
                        Trạng thái: {candidate.lich_phong_van.trang_thai}
                      </div>
                    </div>
                  </div>
                )}
                {candidate.nhan_xet && (
                  <div className="mb-4">
                    <div className="fw-bold mb-2">Nhận xét:</div>
                    <div className="p-3 border-start border-4 border-info bg-light">
                      {candidate.nhan_xet}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-4 candidate-card document-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Tài liệu
                </h5>
              </div>
              <div className="card-body">
                {candidate.cv_filepath ? (
                  <div>
                    <div className="cv-preview mt-3">
                      <div className="fw-bold mb-2">Xem trước CV:</div>
                      <div className="cv-preview-container border rounded shadow-sm">
                        {candidate.cv_filepath.toLowerCase().endsWith(".pdf") ? (
                          <iframe
                            src={`${import.meta.env.VITE_BACKEND_URL}/${candidate.cv_filepath}`}
                            className="cv-preview-frame"
                            style={{ width: "100%", height: "500px", border: "none" }}
                            title="Xem trước CV"
                          />
                        ) : candidate.cv_filepath.toLowerCase().endsWith(".docx") ? (
                          <div className="p-3">
                            <div className="alert alert-info mb-3">
                              <i className="bi bi-file-earmark-word me-2"></i>
                              Định dạng DOCX không hỗ trợ xem trước. Vui lòng tải xuống để xem.
                            </div>
                            <button
                              onClick={downloadCV}
                              className="btn btn-success w-100"
                            >
                              <i className="bi bi-file-earmark-arrow-down me-2"></i>
                              Tải xuống CV
                            </button>
                          </div>
                        ) : (
                          <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Không thể xem trước định dạng file này.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Ứng viên chưa có file CV
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCandidateDetailPage;