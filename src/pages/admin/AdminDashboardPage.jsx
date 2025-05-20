import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/candidates/summary")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi lấy thống kê:", err);
      });
  }, []);

  return (
    <AdminLayout>
      <div className="admin-card">
        <h2>📊 Thống kê tổng quan</h2>
        {stats ? (
          <>
            <p>✅ {stats.new_candidates} Ứng viên mới</p>
            <p>✅ {stats.interviewed} Đã phỏng vấn</p>
            <p>✅ {stats.results_sent} Đã gửi kết quả</p>
          </>
        ) : (
          <p>Đang tải thống kê...</p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
