import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";
import { useNavigate } from "react-router-dom";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const roles = ["Quản trị viên", "Nhân sự", "Người xem"];
  const API_URL = import.meta.env.VITE_BACKEND_URL + "/users";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng '${username}'?`)) return;

    try {
      const res = await fetch(`${API_URL}/${username}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa người dùng");

      alert("🗑️ Đã xóa người dùng thành công");
      fetchUsers();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    }
  };

  const openEditModal = (user) => {
    setEditData({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`${API_URL}/${editData.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editData.role,
          name: editData.name
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Cập nhật thất bại");
      }

      alert("✅ Đã cập nhật người dùng");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="admin-card">
        <h2>🛡️ Quản lý Người dùng & Phân quyền</h2>
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx}>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditModal(user)}>
                        <i className="bi bi-pencil-square"></i> Sửa
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(user.username)}>
                        <i className="bi bi-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="btn btn-primary mt-4" onClick={() => navigate("/admin/users/add")}>
          <i className="bi bi-person-plus-fill me-2"></i>
          ➕ Thêm Người dùng
        </button>


      </div>

      {/* Modal sửa người dùng */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5 className="text-primary mb-4">🛠️ Sửa thông tin người dùng</h5>

            <label className="form-label">Tên đăng nhập</label>
            <input className="form-control mb-3" type="text" value={editData.username} />

            <label className="form-label">Họ tên</label>
            <input
              className="form-control mb-3"
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />

            <label className="form-label">Vai trò</label>
            <select
              className="form-select mb-4"
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            >
              {roles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className="btn btn-success" onClick={handleUpdateUser}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default AdminUsersPage;
