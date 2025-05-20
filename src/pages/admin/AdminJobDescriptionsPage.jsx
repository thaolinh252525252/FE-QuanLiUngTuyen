import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

function AdminJobDescriptionsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formData, setFormData] = useState({
    vi_tri: "",
    mo_ta: "",
    yeu_cau: "",
    han_nop: ""
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const API_URL = BASE_URL + "/job-descriptions";

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
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
        setJobs(data);
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

  const handleEditClick = (job) => {
    console.log("Đang mở modal cho:", job);
    setCurrentJob(job);
    setFormData({
      vi_tri: job.vi_tri || "",
      mo_ta: job.mo_ta || "",
      yeu_cau: job.yeu_cau || "",
      han_nop: job.han_nop || ""
    });
    setShowModal(true);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentJob(null);
    setUpdateError(null);
    setUpdateSuccess(false);
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

    if (!currentJob) return;

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const updateURL = `${API_URL}/${currentJob.id}`;
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
        if (response.status === 404) {
          throw new Error("Không tìm thấy endpoint hoặc ID công việc trên server. Vui lòng kiểm tra backend.");
        } else {
          throw new Error(`Lỗi ${response.status}: ${errorText || "Không thể cập nhật"}`);
        }
      }

      const result = await response.json();
      console.log("✅ Kết quả cập nhật:", result);

      setJobs(jobs.map(item =>
        item.id === currentJob.id ? { ...item, ...formData } : item
      ));

      setUpdateSuccess(true);

      setTimeout(() => {
        setShowModal(false);
        setCurrentJob(null);
        setUpdateSuccess(false);
      }, 1500);

    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      { frameData } setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.vi_tri?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (jobId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá mô tả công việc này?")) return;

    try {
      const response = await fetch(`${API_URL}/${jobId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Không thể xoá công việc");
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      alert("✅ Đã xoá mô tả công việc");
    } catch (err) {
      console.error("❌ Lỗi xoá công việc:", err);
      alert("❌ Lỗi khi xoá công việc");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card shadow-lg rounded-3 border-0" style={{ backgroundColor: '#fff', padding: '2rem', margin: '1.5rem auto', maxWidth: '1200px' }}>
        <h2 className="mb-5 text-primary" style={{ fontWeight: 'bold', fontSize: '1.8rem', background: 'linear-gradient(90deg, #0d6efd, #0a58ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quản lý Mô tả Công việc
        </h2>

        <div className="d-flex justify-content-between mb-5 flex-wrap gap-3">
          <button
            className="btn btn-primary rounded-pill px-5 py-2 button-add-jd"
            onClick={() => navigate("/admin/job-descriptions/add")}
            style={{ fontWeight: '600', transition: 'all 0.3s ease', background: 'linear-gradient(135deg, #0d6efd, #0a58ca)', border: 'none' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Thêm Mô tả Công việc
          </button>

          <div className="input-group ms-auto" style={{ maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="Tìm kiếm vị trí công việc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control rounded-pill border shadow-sm"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                backgroundColor: '#f8f9fa',
                borderColor: '#e9ecef',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 4px 10px rgba(13, 110, 253, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem', borderWidth: '0.4em' }} role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Đang tải dữ liệu, vui lòng chờ...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-3 fade show" role="alert" style={{ backgroundColor: '#fff0f0', borderColor: '#ffdede', padding: '1.5rem', boxShadow: '0 2px 10px rgba(220, 53, 69, 0.1)' }}>
            <div className="d-flex align-items-center">
              <strong style={{ fontSize: '1.2rem' }}>Lỗi:</strong> <span style={{ fontSize: '1.1rem' }}>{error}</span>
              <p className="mb-0 small mt-1 text-danger-emphasis">Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="alert alert-warning rounded-3 text-center py-5" role="alert" style={{ backgroundColor: '#fff9e6', borderColor: '#ffecb3', boxShadow: '0 2px 10px rgba(255, 193, 7, 0.1)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Không có mô tả công việc nào phù hợp với tiêu chí tìm kiếm.</span>
          </div>
        ) : (
          <div className="table-responsive rounded-3 overflow-hidden border" style={{ borderColor: '#e9ecef', boxShadow: '0 4px 20px rgba(0, 0, 0, 世界 0.05)' }}>
            <table className="table table-hover mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ background: 'linear-gradient(to right, #e6f2ff, #f0f7ff)', color: '#0a58ca', fontWeight: '600' }}>
                <tr>
                  <th scope="col" className="ps-4 py-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Vị trí Công Việc</th>
                  <th scope="col" className="py-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Mô tả</th>
                  <th scope="col" className="py-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Yêu cầu</th>
                  <th scope="col" className="py-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Hạn nộp</th>
                  <th scope="col" className="pe-4 py-3 text-center" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                      transition: 'background-color 0.3s ease, transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9f9f9'}
                  >
                    <td className="ps-4 fw-semibold align-middle" style={{ fontSize: '0.95rem', color: '#343a40' }}>{job.vi_tri}</td>
                    <td className="align-middle" style={{ fontSize: '0.9rem', color: '#495057' }}>
                      {job.mo_ta && job.mo_ta.length > 100
                        ? <span title={job.mo_ta}>{`${job.mo_ta.substring(0, 100)}...`}</span>
                        : job.mo_ta}
                    </td>
                    <td className="align-middle" style={{ fontSize: '0.9rem', color: '#495057' }}>
                      {job.yeu_cau && job.yeu_cau.length > 100
                        ? <span title={job.yeu_cau}>{`${job.yeu_cau.substring(0, 100)}...`}</span>
                        : job.yeu_cau}
                    </td>
                    <td className="align-middle" style={{ fontSize: '0.9rem', color: '#495057' }}>
                      <span className="badge bg-light text-dark px-3 py-1 rounded-pill" style={{ backgroundColor: '#e9ecef !important', fontWeight: '500' }}>
                        {job.han_nop ? job.han_nop.split('T')[0] : 'Không xác định'}
                      </span>
                    </td>
                    <td className="pe-4 text-center align-middle">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-4 py-1"
                        onClick={() => handleEditClick(job)}
                        style={{
                          fontSize: '0.85rem',
                          transition: 'all 0.3s ease',
                          borderColor: '#0d6efd',
                          color: '#0d6efd',
                          boxShadow: '0 2px 5px rgba(13, 110, 253, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#0d6efd';
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#0d6efd';
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-4 py-1 ms-2"
                        onClick={() => handleDelete(job.id)}
                        style={{
                          fontSize: '0.85rem',
                          transition: 'all 0.3s ease',
                          borderColor: '#dc3545',
                          color: '#dc3545',
                          boxShadow: '0 2px 5px rgba(220, 53, 69, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#dc3545';
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#dc3545';
                        }}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.5s ease-in-out',
            opacity: showModal ? 1 : 0
          }}
        >
          <div
            className="modal-content shadow-xl rounded-4 overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              width: '850px',
              maxWidth: '98%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #e9ecef',
              animation: 'modalScaleIn 0.3s ease-out',
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.25)'
            }}
          >
            <style>
              {`
                @keyframes modalScaleIn {
                  from {
                    transform: scale(0.8);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                .floating-label-group {
                  position: relative;
                  margin-bottom: 2rem;
                }
                .floating-label {
                  position: absolute;
                  top: 50%;
                  left: 1rem;
                  transform: translateY(-50%);
                  font-size: 0.95rem;
                  color: #6c757d;
                  transition: all 0.2s ease-out;
                  pointer-events: none;
                  background-color: transparent;
                  padding: 0 0.25rem;
                }
                .floating-label-group input:not(:placeholder-shown) ~ .floating-label,
                .floating-label-group textarea:not(:placeholder-shown) ~ .floating-label,
                .floating-label-group input:focus ~ .floating-label,
                .floating-label-group textarea:focus ~ .floating-label {
                  top: -0.5rem;
                  font-size: 0.75rem;
                  color: #0a58ca;
                  background-color: #ffffff;
                  padding: 0 0.5rem;
                }
                .modal-content::-webkit-scrollbar {
                  width: 8px;
                }
                .modal-content::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 4px;
                }
                .modal-content::-webkit-scrollbar-thumb {
                  background: #0a58ca;
                  border-radius: 4px;
                }
                .modal-content::-webkit-scrollbar-thumb:hover {
                  background: #0947a1;
                }
              `}
            </style>
            <div
              className="modal-header text-white"
              style={{
                background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                borderBottom: 'none',
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h5 className="modal-title m-0" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                Chỉnh sửa Công việc
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-close-detail"
                onClick={handleCloseModal}
                disabled={updating}
                aria-label="Close"
                style={{ filter: 'brightness(1.3)', width: '1.8rem', height: '1.8rem', opacity: updating ? 0.5 : 1 }}
              >Hủy</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '2.5rem' }}>
                {updateError && (
                  <div className="alert alert-danger rounded-3 mb-4 fade show" role="alert" style={{ backgroundColor: '#fef0f0', border: '1px solid #ffdede', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(220, 53, 69, 0.15)' }}>
                    <span style={{ fontSize: '0.95rem', color: '#dc3545' }}>Lỗi: {updateError}</span>
                  </div>
                )}

                {updateSuccess && (
                  <div className="alert alert-success rounded-3 mb-4 fade show" role="alert" style={{ backgroundColor: '#e6f4e6', border: '1px solid #b8dab8', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(40, 167, 69, 0.15)' }}>
                    <span style={{ fontSize: '0.95rem', color: '#28a745' }}>Cập nhật thành công!</span>
                  </div>
                )}

                <div className="small text-muted mb-4" style={{ fontSize: '0.85rem', backgroundColor: '#f8f9fa', padding: '0.75rem 1rem', borderRadius: '8px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                  ID: <span className="fw-semibold">{currentJob?.id}</span>
                </div>

                <div className="floating-label-group mb-4">
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    id="vi_tri"
                    name="vi_tri"
                    value={formData.vi_tri}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.95rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.borderColor = '#0d6efd';
                      e.target.style.boxShadow = '0 4px 10px rgba(13, 110, 253, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                  <label htmlFor="vi_tri" className="floating-label">Vị trí tuyển dụng <span style={{ color: '#dc3545' }}>*</span></label>
                </div>

                <div className="floating-label-group mb-4">
                  <textarea
                    className="form-control shadow-sm"
                    id="mo_ta"
                    name="mo_ta"
                    value={formData.mo_ta}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    placeholder=" "
                    style={{
                      resize: 'vertical',
                      minHeight: '140px',
                      padding: '1rem 1.5rem',
                      fontSize: '0.95rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.borderColor = '#0d6efd';
                      e.target.style.boxShadow = '0 4px 10px rgba(13, 110, 253, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                  <label htmlFor="mo_ta" className="floating-label">Mô tả công việc <span style={{ color: '#dc3545' }}>*</span></label>
                </div>

                <div className="floating-label-group mb-4">
                  <textarea
                    className="form-control shadow-sm"
                    id="yeu_cau"
                    name="yeu_cau"
                    value={formData.yeu_cau}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    placeholder=" "
                    style={{
                      resize: 'vertical',
                      minHeight: '140px',
                      padding: '1rem 1.5rem',
                      fontSize: '0.95rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.borderColor = '#0d6efd';
                      e.target.style.boxShadow = '0 4px 10px rgba(13, 110, 253, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                  <label htmlFor="yeu_cau" className="floating-label">Yêu cầu ứng viên <span style={{ color: '#dc3545' }}>*</span></label>
                </div>

                <div className="floating-label-group mb-3">
                  <input
                    type="date"
                    className="form-control shadow-sm"
                    id="han_nop"
                    name="han_nop"
                    value={formData.han_nop ? formData.han_nop.split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.95rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.borderColor = '#0d6efd';
                      e.target.style.boxShadow = '0 4px 10px rgba(13, 110, 253, 0.2)';
                      e.target.showPicker();
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.borderColor = '#e9ecef';
                      e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                  <label htmlFor="han_nop" className="floating-label">Hạn nộp hồ sơ <span style={{ color: '#dc3545' }}>*</span></label>
                </div>
              </div>

              <div
                className="modal-footer border-top-0"
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-5 py-2"
                  onClick={handleCloseModal}
                  disabled={updating}
                  style={{
                    transition: 'all 0.3s ease',
                    borderColor: '#6c757d',
                    color: '#6c757d',
                    fontWeight: '500',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-5 py-2"
                  disabled={updating || updateSuccess}
                  style={{
                    transition: 'all 0.3s ease',
                    minWidth: '140px',
                    background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                    border: 'none',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : updateSuccess ? (
                    <>
                      Đã lưu
                    </>
                  ) : (
                    <>
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

export default AdminJobDescriptionsPage;