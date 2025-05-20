import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/candidates">Ứng viên</Link></li>
        <li><Link to="/admin/job-descriptions">Mô tả công việc</Link></li>
        <li><Link to="/admin/interviews">Lịch phỏng vấn</Link></li>
        <li><Link to="/admin/reports">Báo cáo</Link></li>
        <li><Link to="/admin/users">Quản lý người dùng</Link></li>
        <li><Link to="/admin/potential-emails">Xem Email Tiềm năng</Link></li>
      </ul>
    </div>
  );
}

export default AdminSidebar;
