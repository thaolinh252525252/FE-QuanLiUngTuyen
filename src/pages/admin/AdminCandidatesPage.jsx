import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../Admin.css";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/candidates/";

function AdminCandidatesPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "pass", "fail", "scheduled", "pending"
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "today", "yesterday", "7days", "30days"
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Chuẩn hóa dữ liệu ứng viên
  const normalizeCandidate = (candidate) => ({
    id: candidate.id || "",
    ho_ten: candidate.ho_ten || "-",
    email: candidate.email || "-",
    so_dien_thoai: candidate.so_dien_thoai || "-",
    vi_tri_ung_tuyen: candidate.vi_tri_ung_tuyen || "-",
    ket_qua: candidate.ket_qua || "",
    lich_phong_van: candidate.lich_phong_van ? {
      ngay: candidate.lich_phong_van.ngay || "-",
      gio: candidate.lich_phong_van.gio || "-",
      dia_diem: candidate.lich_phong_van.dia_diem || "-",
      trang_thai: candidate.lich_phong_van.trang_thai || "Đã lên lịch"
    } : null,
    ngay_sinh: candidate.ngay_sinh || "",
    ngay_gui: candidate.ngay_gui || ""
  });

  // Fetch candidates với polling thông minh
  useEffect(() => {
    const fetchCandidates = () => {
      setIsLoading(true);
      fetch(API_URL)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("✅ Danh sách ứng viên:", data);
          if (candidates.length > 0 && data.length > candidates.length) {
            toast.success(`Đã tải ${data.length - candidates.length} ứng viên mới!`, {
              position: "top-right",
              autoClose: 3000,
            });
          }
          setCandidates(data.map(normalizeCandidate));
          setIsLoading(false);
        })
        .catch(err => {
          console.error("❌ Lỗi lấy ứng viên:", err);
          toast.error(`Không thể tải danh sách ứng viên: ${err.message}`, {
            position: "top-right",
            autoClose: 3000,
          });
          setIsLoading(false);
        });
    };

    //Kiểm tra thời gian để polling gần 8:00 sáng
    const shouldPoll = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      return hours === 7 && minutes >= 55 || hours === 8 && minutes <= 5;
    };
    // const shouldPoll = () => {
    //   const now = new Date();
    //   const hours = now.getHours();
    //   const minutes = now.getMinutes();
    //   return hours === 23 && minutes >= 28 && hours === 23 && minutes <= 30;
    // };
    fetchCandidates(); // Gọi lần đầu
    const interval = setInterval(() => {
      if (shouldPoll()) {
        fetchCandidates();
      }
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [candidates.length]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const filteredCandidates = candidates.filter(c => {
    const searchMatch = (c.ho_ten || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.so_dien_thoai || "").includes(search) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.vi_tri_ung_tuyen || "").toLowerCase().includes(search.toLowerCase());

    let statusMatch = true;
    if (filter === "pass") statusMatch = c.ket_qua === "Pass";
    else if (filter === "fail") statusMatch = c.ket_qua && c.ket_qua !== "Pass";
    else if (filter === "scheduled") statusMatch = !!c.lich_phong_van;
    else if (filter === "pending") statusMatch = !c.ket_qua;

    let timeMatch = true;
    if (timeFilter !== "all" && c.ngay_gui) {
      const receivedDate = new Date(c.ngay_gui);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      if (timeFilter === "today") {
        timeMatch = receivedDate >= today;
      } else if (timeFilter === "yesterday") {
        timeMatch = receivedDate >= yesterday && receivedDate < today;
      } else if (timeFilter === "7days") {
        timeMatch = receivedDate >= sevenDaysAgo;
      } else if (timeFilter === "30days") {
        timeMatch = receivedDate >= thirtyDaysAgo;
      }
    }

    return searchMatch && statusMatch && timeMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const formatHocVan = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "-";
    return arr.map((e, i) => {
      if (typeof e === "string") return `${i + 1}. ${e}`;
      return `${i + 1}. ${e.ten_truong || ""} - ${e.chuyen_nganh || ""} (${e.nam_tot_nghiep || ""})`;
    }).join("\n");
  };

  const formatKinhNghiem = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "-";
    return arr.map((e, i) => {
      if (typeof e === "string") return `${i + 1}. ${e}`;
      return `${i + 1}. ${e.vi_tri || ""} tại ${e.ten_cong_ty || e.cong_ty || ""} (${e.thoi_gian || ""})`;
    }).join("\n");
  };

  const handleStatusChange = (id, newStatus) => {
    if (!id || id === "undefined") {
      console.error("❌ Không tìm thấy ID ứng viên hợp lệ.");
      alert("❌ Không thể cập nhật. ID ứng viên không hợp lệ.");
      return;
    }
    console.log("📤 Gửi cập nhật ID:", id, "Trạng thái:", newStatus);

    setIsLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/${id}/update-result?result=${encodeURIComponent(newStatus)}`, {
      method: "PATCH",
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(updated => {
        setCandidates(prev => prev.map(c => (c.id === id ? normalizeCandidate(updated) : c)));
        toast.success(`Đã gửi email kết quả "${newStatus}" cho ${updated.ho_ten}`, {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("❌ Lỗi khi gửi kết quả:", err);
        toast.error(`Không thể gửi kết quả: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
      });
  };

  const handleScheduleButtonClick = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ứng viên để đặt lịch phỏng vấn", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const alreadyScheduled = candidates.filter(c => selectedIds.includes(c.id) && c.lich_phong_van);
    if (alreadyScheduled.length > 0) {
      const names = alreadyScheduled.map(c => c.ho_ten).join(", ");
      toast.error(`Không thể đặt lịch. Các ứng viên sau đã có lịch phỏng vấn: ${names}`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const notPassed = candidates.filter(c => selectedIds.includes(c.id) && c.ket_qua !== "Pass");
    if (notPassed.length > 0) {
      const names = notPassed.map(c => c.ho_ten).join(", ");
      toast.error(`Không thể đặt lịch. Các ứng viên sau chưa Pass CV: ${names}`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setShowScheduleModal(true);
  };

  const handleSchedule = () => {
    if (selectedIds.length && date && time && location) {
      const alreadyScheduled = candidates.filter(c => selectedIds.includes(c.id) && c.lich_phong_van);
      const notPassed = candidates.filter(c => selectedIds.includes(c.id) && c.ket_qua !== "Pass");

      if (alreadyScheduled.length > 0) {
        const names = alreadyScheduled.map(c => c.ho_ten).join(", ");
        toast.error(`Không thể đặt lịch. Các ứng viên sau đã có lịch phỏng vấn: ${names}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (notPassed.length > 0) {
        const names = notPassed.map(c => c.ho_ten).join(", ");
        toast.error(`Không thể đặt lịch. Các ứng viên sau chưa Pass CV: ${names}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setIsLoading(true);
      fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/schedule-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateIds: selectedIds,
          date,
          time,
          location
        }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("📥 Phản hồi từ server:", data);
          if (data.success) {
            const updateStatusPromises = selectedIds.map(id =>
              fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/${id}/update-status`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  trang_thai: "Đã lên lịch phỏng vấn"
                }),
              })
                .then(res => {
                  if (!res.ok) {
                    throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
                  }
                  return res.json();
                })
                .catch(err => {
                  console.error(`❌ Lỗi cập nhật trạng thái cho ứng viên ${id}:`, err);
                  return null;
                })
            );

            Promise.all(updateStatusPromises)
              .then(() => {
                toast.success(data.message, {
                  position: "top-right",
                  autoClose: 3000,
                });

                fetch(API_URL)
                  .then(res => {
                    if (!res.ok) {
                      throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
                    }
                    return res.json();
                  })
                  .then(updatedCandidates => {
                    setCandidates(updatedCandidates.map(normalizeCandidate));
                    setSelectedIds([]);
                    setShowScheduleModal(false);
                    setDate("");
                    setTime("");
                    setLocation("");
                    setIsLoading(false);
                  })
                  .catch(err => {
                    console.error("❌ Lỗi khi làm mới danh sách:", err);
                    setIsLoading(false);
                  });
              })
              .catch(err => {
                console.error("❌ Lỗi khi cập nhật trạng thái:", err);
                toast.error("Đã đặt lịch phỏng vấn, nhưng không thể cập nhật trạng thái.", {
                  position: "top-right",
                  autoClose: 3000,
                });
                setIsLoading(false);
              });
          } else {
            toast.error(data.message || "Không thể đặt lịch phỏng vấn", {
              position: "top-right",
              autoClose: 3000,
            });
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error("❌ Lỗi khi đặt lịch phỏng vấn:", err);
          toast.error(`Không thể đặt lịch phỏng vấn: ${err.message}`, {
            position: "top-right",
            autoClose: 3000,
          });
          setIsLoading(false);
        });
    } else {
      toast.error("Vui lòng nhập đầy đủ thông tin lịch phỏng vấn", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteCandidate = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    if (!candidateToDelete || !candidateToDelete.id) {
      console.error("❌ Không tìm thấy ID ứng viên hợp lệ để xóa.");
      setShowDeleteConfirmModal(false);
      return;
    }

    console.log("🗑️ Đang xóa ứng viên ID:", candidateToDelete.id);
    setIsLoading(true);

    fetch(`${import.meta.env.VITE_BACKEND_URL}/candidates/${candidateToDelete.id}`, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("✅ Đã xóa ứng viên:", data);
        setCandidates(prev => prev.filter(c => c.id !== candidateToDelete.id));
        toast.success(`Đã xóa ứng viên ${candidateToDelete.ho_ten} thành công`, {
          position: "top-right",
          autoClose: 3000,
        });
        setShowDeleteConfirmModal(false);
        setCandidateToDelete(null);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("❌ Lỗi khi xóa ứng viên:", err);
        toast.error(`Không thể xóa ứng viên: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        setShowDeleteConfirmModal(false);
        setIsLoading(false);
      });
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge bg-secondary">Chưa đánh giá</span>;
    if (status === "Pass") return <span className="badge bg-success">Pass</span>;
    if (status.includes("Fail")) return <span className="badge bg-danger">{status}</span>;
    return <span className="badge bg-info">{status}</span>;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout>
      <ToastContainer />
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-primary">Đang xử lý...</p>
          </div>
        </div>
      )}

      <div className="admin-card shadow">
        <h2 className="mb-4 text-primary d-flex align-items-center">
          Quản lý Ứng viên
        </h2>

        <div className="d-flex flex-wrap gap-3 mb-[10px] list-button">
          <button className="btn btn-primary shadow-sm" onClick={() => navigate("/admin/candidates/add")}>
            Thêm Ứng Viên Mới
          </button>
          <button className="btn btn-info text-white shadow-sm" onClick={handleScheduleButtonClick}>
            Đặt lịch phỏng vấn
          </button>
        </div>


        <div className="row mb-4 g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white text-primary"></span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên, email, SĐT, vị trí..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch("")}
                ></button>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="row g-2 align-items-center">
              <div className="col-md-8">
                <div className="btn-group w-100 shadow-sm">
                  <button
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => {
                      setFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    Tất cả
                  </button>
                  <button
                    className={`btn ${filter === "pass" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => {
                      setFilter("pass");
                      setCurrentPage(1);
                    }}
                  >
                    Pass CV
                  </button>
                  <button
                    className={`btn ${filter === "fail" ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={() => {
                      setFilter("fail");
                      setCurrentPage(1);
                    }}
                  >
                    Fail
                  </button>
                  <button
                    className={`btn ${filter === "scheduled" ? "btn-info text-white" : "btn-outline-info"}`}
                    onClick={() => {
                      setFilter("scheduled");
                      setCurrentPage(1);
                    }}
                  >
                    Đã có lịch
                  </button>
                  <button
                    className={`btn ${filter === "pending" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => {
                      setFilter("pending");
                      setCurrentPage(1);
                    }}
                  >
                    Chưa đánh giá
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select shadow-sm select-datetime"
                  value={timeFilter}
                  onChange={(e) => {
                    setTimeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="7days">7 ngày</option>
                  <option value="30days">30 ngày</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive shadow rounded">
          <table className="table table-striped table-hover candidate-table mb-0">
            <thead className="table-primary sticky-top">
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input shadow-sm"
                    checked={currentItems.length > 0 && selectedIds.length === currentItems.length &&
                      currentItems.every(c => selectedIds.includes(c.id))}
                    onChange={() => {
                      const allCurrentIds = currentItems.map(c => c.id);
                      const allSelected = currentItems.every(c => selectedIds.includes(c.id));
                      if (allSelected) {
                        setSelectedIds(prev => prev.filter(id => !allCurrentIds.includes(id)));
                      } else {
                        const newSelected = [...selectedIds];
                        allCurrentIds.forEach(id => {
                          if (!newSelected.includes(id)) {
                            newSelected.push(id);
                          }
                        });
                        setSelectedIds(newSelected);
                      }
                    }}
                  />
                </th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vị trí</th>
                <th>Kết quả</th>
                <th>Lịch phỏng vấn</th>
                <th>Thời gian nhận</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((c) => (
                  <tr key={c.id} className="align-middle">
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input shadow-sm"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{c.ho_ten}</div>
                      {c.ngay_sinh && (
                        <small className="text-muted d-flex align-items-center mt-1">
                          {c.ngay_sinh}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span>{c.so_dien_thoai}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border shadow-sm px-2 py-2">
                        {c.vi_tri_ung_tuyen}
                      </span>
                    </td>
                    <td>
                      <div className="mb-2">
                        {getStatusBadge(c.ket_qua)}
                      </div>
                      <div className="mt-2">
                        <select
                          className="form-select form-select-sm shadow-sm"
                          defaultValue=""
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          <option value="">-- Cập nhật --</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail CV">Fail CV</option>
                          <option value="Fail Interview">Fail Interview</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      {c.lich_phong_van ? (
                        <div className="interview-schedule p-2 border rounded bg-light shadow-sm">
                          <span className="badge bg-info text-white mb-2">
                            {c.lich_phong_van.trang_thai}
                          </span>
                          <div className="small">
                            {c.lich_phong_van.ngay}
                          </div>
                          <div className="small">
                            {c.lich_phong_van.gio}
                          </div>
                          <div className="small text-truncate" style={{ maxWidth: "150px" }}
                            title={c.lich_phong_van.dia_diem}>
                            {c.lich_phong_van.dia_diem}
                          </div>
                        </div>
                      ) : (
                        c.ket_qua === "Pass" ? (
                          <div className="text-center">
                            <span className="text-muted fst-italic d-block mb-2">Chưa có lịch</span>
                            <button
                              className="btn btn-sm btn-outline-info shadow-sm"
                              onClick={() => {
                                setSelectedIds([c.id]);
                                setShowScheduleModal(true);
                              }}
                            >
                              Đặt lịch
                            </button>
                          </div>
                        ) : (
                          <span className="text-danger fst-italic">Chưa đủ điều kiện</span>
                        )
                      )}
                    </td>
                    <td>
                      <div className="small">
                        {c.ngay_gui ? new Date(c.ngay_gui).toLocaleString('vi-VN') : "-"}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-2 button-list">
                        <button
                          className="btn btn-sm btn-outline-primary shadow-sm button-detail"
                          onClick={() => navigate(`/admin/candidates/${c.id}`)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger shadow-sm"
                          onClick={() => handleDeleteCandidate(c)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="empty-state">
                      <p className="mb-0 mt-3 text-muted">Không tìm thấy ứng viên nào phù hợp với điều kiện tìm kiếm</p>
                      {search && (
                        <button
                          className="btn btn-sm btn-outline-primary mt-3"
                          onClick={() => setSearch("")}
                        >
                          Xóa tìm kiếm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <span>Tổng số: <strong>{candidates.length}</strong> ứng viên</span>
              {filteredCandidates.length !== candidates.length && (
                <span className="ms-2 text-muted">(Hiển thị: <strong>{filteredCandidates.length}</strong>)</span>
              )}
            </div>
            {selectedIds.length > 0 && (
              <div className="badge bg-primary ms-2 p-2">
                Đã chọn: {selectedIds.length}
              </div>
            )}
          </div>

          {filteredCandidates.length > itemsPerPage && (
            <nav className="d-flex justify-items-center mt-4">
              <ul className="pagination pagination-sm shadow-sm rounded-pill bg-white px-3">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link border-0" onClick={() => paginate(1)} title="Trang đầu">
                    <i className="bi bi-chevron-double-left" />
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link border-0" onClick={() => paginate(currentPage - 1)} title="Trang trước">
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button
                      className={`page-link border-0 ${currentPage === pageNum ? 'bg-primary text-white' : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link border-0" onClick={() => paginate(currentPage + 1)} title="Trang sau">
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link border-0" onClick={() => paginate(totalPages)} title="Trang cuối">
                    <i className="bi bi-chevron-double-right" />
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {selectedIds.length > 0 && (
            <div className="mt-3 mt-md-0">
              <button
                className="btn btn-info text-white shadow-sm"
                onClick={handleScheduleButtonClick}
              >
                Đặt lịch cho {selectedIds.length} ứng viên đã chọn
              </button>
            </div>
          )}
        </div>

        {showScheduleModal && (
          <div className="modal-overlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)"
          }}>
            <div className="modal-content" style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "600px",
              maxWidth: "95%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="m-0 text-primary">
                  Đặt lịch phỏng vấn
                </h4>
                <button
                  className="btn-close"
                  onClick={() => setShowScheduleModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Ứng viên đã chọn ({selectedIds.length}):</h5>
                <div style={{ maxHeight: "200px", overflow: "auto" }} className="border rounded shadow-sm">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-primary sticky-top">
                      <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates
                        .filter(c => selectedIds.includes(c.id))
                        .map(c => (
                          <tr key={c.id}>
                            <td>{c.ho_ten}</td>
                            <td>{c.email}</td>
                            <td>
                              <span className="badge bg-success">Đủ điều kiện</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form>
                <div className="mb-3">
                  <label className="form-label fw-bold text-primary">
                    Ngày phỏng vấn:
                  </label>
                  <input
                    type="date"
                    className="form-control shadow-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-primary">
                    Giờ phỏng vấn:
                  </label>
                  <input
                    type="time"
                    className="form-control shadow-sm"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-primary">
                    Địa điểm:
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Nhập địa điểm phỏng vấn"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex justify-content-end gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary shadow"
                    onClick={handleSchedule}
                  >
                    Xác nhận đặt lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirmModal && candidateToDelete && (
          <div className="modal-overlay" style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)"
          }}>
            <div className="modal-content" style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "95%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}>
              <div className="text-center mb-4">
                <h4 className="mt-3 text-danger">Xác nhận xóa ứng viên</h4>
              </div>

              <div className="alert alert-warning">
                <p className="mb-0">Bạn có chắc chắn muốn xóa ứng viên <strong>{candidateToDelete.ho_ten}</strong>?</p>
                <p className="mt-2 mb-0">Hành động này không thể hoàn tác.</p>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setCandidateToDelete(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger shadow"
                  onClick={confirmDelete}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(3px);
          }
          
          .spinner-container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          
          .candidate-table th {
            position: sticky;
            top: 0;
            background-color: #e7f1ff;
            z-index: 10;
          }
          
          .interview-schedule {
            transition: all 0.2s ease;
          }
          
          .interview-schedule:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          .admin-card {
            background-color: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
          }
          
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px;
          }
          
          .btn {
            transition: all 0.2s;
          }
          
          .btn:hover {
            transform: translateY(-1px);
          }
          
          .form-check-input {
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .form-check-input:checked {
            background-color: #0d6efd;
            border-color: #0d6efd;
          }
          
          .pagination {
            margin-bottom: 0;
          }
          
          .page-link {
            color: #0d6efd;
            border-color: #dee2e6;
            padding: 0.375rem 0.75rem;
          }
          
          .page-item.active .page-link {
            background-color: #0d6efd;
            border-color: #0d6efd;
          }
          
          .page-link:focus {
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
          
          tbody tr {
            transition: all 0.2s;
          }
          
          tbody tr:hover {
            background-color: rgba(13, 110, 253, 0.05) !important;
          }
          
          .form-select {
            transition: all 0.2s;
          }
          
          .form-select:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default AdminCandidatesPage;