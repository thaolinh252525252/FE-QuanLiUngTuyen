import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../Admin.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const COLORS = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6c757d"];

function AdminReportsPage() {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/candidates/stats")
      .then((res) => res.json())
      .then((data) => {
        console.log("📊 Dữ liệu thống kê:", data);
        setReportData(data);
      })
      .catch((err) => {
        console.error("❌ Lỗi lấy dữ liệu thống kê:", err);
      });
  }, []);

  if (!reportData) {
    return (
      <AdminLayout>
        <div className="admin-card d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải thống kê...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const {
    total,
    by_status,
    by_position,
    scheduled_count,
    high_score_count,
    by_month
  } = reportData;

  const pieData = Object.entries(by_status).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const barData = Object.entries(by_position).map(([position, count]) => ({
    position,
    count,
  }));

  const lineData = Object.entries(by_month || {}).map(([month, count]) => ({
    month,
    count,
  }));

  return (
    <AdminLayout>
      <div className="admin-card shadow-sm p-4">
        <h2 className="mb-4 text-primary">
          <i className="bi bi-graph-up-arrow me-2"></i>
          Báo cáo Thống kê Ứng viên
        </h2>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-box bg-primary text-white p-3 rounded shadow-sm">
              <h5 className="mb-2"><i className="bi bi-people-fill me-2"></i>Tổng ứng viên</h5>
              <h3>{total}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-box bg-info text-white p-3 rounded shadow-sm">
              <h5 className="mb-2"><i className="bi bi-calendar-check me-2"></i>Đã có lịch PV</h5>
              <h3>{scheduled_count}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-box bg-success text-white p-3 rounded shadow-sm">
              <h5 className="mb-2"><i className="bi bi-award-fill me-2"></i>Điểm {'>='} 80</h5>
              <h3>{high_score_count}</h3>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-light rounded p-3 shadow-sm h-100">
              <h5 className="text-primary"><i className="bi bi-pie-chart me-2"></i>Trạng thái ứng viên</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-light rounded p-3 shadow-sm h-100">
              <h5 className="text-primary"><i className="bi bi-bar-chart-line me-2"></i>Theo vị trí ứng tuyển</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {lineData.length > 0 && (
          <div className="row g-4 mt-4">
            <div className="col-md-12">
              <div className="bg-light rounded p-3 shadow-sm h-100">
                <h5 className="text-primary"><i className="bi bi-calendar-range me-2"></i>Ứng viên theo tháng</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#28a745" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReportsPage;
