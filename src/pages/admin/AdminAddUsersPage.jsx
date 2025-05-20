import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

function AdminAddUsersPage() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("Nhân sự");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL + "/users";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !name.trim()) {
            alert("Vui lòng nhập đầy đủ tên đăng nhập và họ tên.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, name, role }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Tạo người dùng thất bại");
            }

            alert("✅ Đã thêm người dùng thành công");
            navigate("/admin/users"); // Quay lại trang quản lý
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <h2 className="mb-4 text-primary">➕ Thêm Người dùng mới</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="VD: admin, hr01..."
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Họ tên</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="VD: Nguyễn Văn A"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Vai trò</label>
                        <select
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option>Quản trị viên</option>
                            <option>Nhân sự</option>
                            <option>Người xem</option>
                        </select>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/admin/users")}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang thêm..." : "Thêm Người dùng"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

export default AdminAddUsersPage;
