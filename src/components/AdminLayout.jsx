import React from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../App.css";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  // Lấy tên người dùng từ localStorage
  const username = localStorage.getItem("username") || "admin";

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Xóa thông tin trong localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    // Chuyển hướng về trang đăng nhập admin
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span role="img" aria-label="logo">🎯</span> Quản trị hệ thống tuyển dụng
        </div>
        <div className="admin-header-right">
          <span role="img" aria-label="user">👤</span> {username} |
          <button className="logout-button" onClick={handleLogout}>
            <span role="img" aria-label="logout">🔓</span> Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="admin-body">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;