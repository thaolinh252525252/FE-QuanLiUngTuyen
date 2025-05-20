import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

// Thêm debug để kiểm tra URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = BASE_URL + "/candidates/interviews";
console.log("Backend URL:", BASE_URL);
console.log("API Endpoint:", API_URL);

function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [formData, setFormData] = useState({
    candidate: "",
    date: "",
    time: "",
    room: ""
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Thêm effect để xử lý scroll khi modal hiển thị
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const fetchInterviews = async () => {
    try {
      console.log("🔄 Đang gọi API:", API_URL);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(API_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Phản hồi lỗi:", res.status, errorText);
        throw new Error(`Lỗi ${res.status}: ${errorText || "Không thể tải dữ liệu"}`);
      }

      const data = await res.json();
      console.log("✅ Dữ liệu nhận được:", data);

      if (Array.isArray(data)) {
        setInterviews(data);
      } else {
        console.error("⚠️ Dữ liệu không hợp lệ:", data);
        setError("Dữ liệu trả về không đúng định dạng mảng");
      }
    } catch (err) {
      console.error("❌ Lỗi chi tiết:", err);
      if (err.name === 'AbortError') {
        setError("Kết nối đến server quá thời gian, vui lòng thử lại");
      } else {
        setError(err.message || "Lỗi không xác định khi kết nối đến server");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (interview) => {
    console.log("Đang mở modal cho:", interview);
    setCurrentInterview(interview);
    setFormData({
      candidate: interview.candidate || "",
      date: interview.date || "",
      time: interview.time || "",
      room: interview.room || ""
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentInterview(null);
    setUpdateError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentInterview) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      // Kiểm tra và điều chỉnh URL API cho cập nhật
      // Thử các cấu trúc URL khác nhau

      // Phương án 1: Sử dụng cấu trúc /api/interviews/{id}
      // const updateURL = `${BASE_URL}/api/interviews/${currentInterview.id}`;

      // Phương án 2: Sử dụng cấu trúc /candidates/interviews/{id}
      const updateURL = `${API_URL}/${currentInterview.id}`;

      // Phương án 3: Sử dụng cấu trúc /interviews/{id}
      // const updateURL = `${BASE_URL}/interviews/${currentInterview.id}`;

      console.log("🔄 Đang cập nhật:", updateURL);
      console.log("📦 Dữ liệu gửi đi:", formData);

      const response = await fetch(updateURL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Phản hồi lỗi:", response.status, errorText);
        throw new Error(`Lỗi ${response.status}: ${errorText || "Không thể cập nhật"}`);
      }

      const result = await response.json();
      console.log("✅ Kết quả cập nhật:", result);

      // Cập nhật dữ liệu trong state
      setInterviews(interviews.map(item =>
        item.id === currentInterview.id ? { ...item, ...formData } : item
      ));

      // Đóng modal
      setShowModal(false);
      setCurrentInterview(null);

    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Phần còn lại không thay đổi
  const filteredInterviews = interviews.filter((i) =>
    i.candidate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-card">
        <h2 className="mb-4">
          <i className="bi bi-calendar-event me-2"></i>
          Lịch Phỏng vấn
        </h2>

        {/* Hiển thị URL API để debug */}
        {error && (
          <div className="small text-muted mb-2">
            API URL: {API_URL}
          </div>
        )}

        <input
          type="text"
          placeholder="Tìm kiếm ứng viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control mb-3"
        />

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <p><strong>Lỗi:</strong> {error}</p>
            <p className="mb-0 small">Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="alert alert-warning">Không có lịch phỏng vấn phù hợp.</div>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr>
                <th>Ứng viên</th>
                <th>Thời gian</th>
                <th>Địa điểm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((i) => (
                <tr key={i.id}>
                  <td className="fw-semibold">{i.candidate}</td>
                  <td>{i.date} {i.time}</td>
                  <td>{i.room}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditClick(i)}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Portal */}
      {showModal && (
        <div
          id="modalPortal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '5px',
              width: '500px',
              maxWidth: '90%',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #dee2e6',
                backgroundColor: '#0d6efd',
                color: 'white',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '5px',
              }}
            >
              <h5>
                <i className="bi bi-pencil-square me-2"></i>
                Chỉnh sửa lịch phỏng vấn
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleCloseModal}
                disabled={updating}
                aria-label="Close"
              >Hủy</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1rem' }}>
                {updateError && (
                  <div className="alert alert-danger mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {updateError}
                  </div>
                )}

                {/* Hiển thị thông tin debug */}
                <div className="small text-muted mb-3">
                  ID: {currentInterview?.id}
                </div>

                <div className="mb-3">
                  <label htmlFor="candidate" className="form-label">Tên ứng viên</label>
                  <input
                    type="text"
                    className="form-control"
                    id="candidate"
                    name="candidate"
                    value={formData.candidate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Ngày phỏng vấn</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="time" className="form-label">Giờ phỏng vấn</label>
                  <input
                    type="time"
                    className="form-control"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="room" className="form-label">Địa điểm</label>
                  <input
                    type="text"
                    className="form-control"
                    id="room"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '1rem',
                  borderTop: '1px solid #dee2e6',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={updating}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminInterviewsPage;
