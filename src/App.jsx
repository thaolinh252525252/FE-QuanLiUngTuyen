import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import JobDetailPage from "./pages/JobDetailPage";
import LookupPage from "./pages/LookupPage";
import AdminJobDescriptionsPage from "./pages/admin/AdminJobDescriptionsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCandidatesPage from "./pages/admin/AdminCandidatesPage";
import AdminInterviewsPage from "./pages/admin/AdminInterviewsPage";
import AdminAddCandidatePage from "./pages/admin/AdminAddCandidatePage";
import AdminCandidateDetailPage from "./pages/admin/AdminCandidateDetailPage";
import AdminAddJobDescriptionPage from "./pages/admin/AdminAddJobDescriptionPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import PotentialEmailsPage from "./pages/admin/PotentialEmailsPage";
import AdminAddUsersPage from "./pages/admin/AdminAddUsersPage";
import LoginPage from "./pages/LoginPage";
// import 'bootstrap-icons/font/bootstrap-icons.css';

// Component bảo vệ route admin
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Kiểm tra đăng nhập và quyền admin
  if (!token) {
    // Chưa đăng nhập, chuyển hướng đến trang đăng nhập admin
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không phải admin
  if (userRole !== "Quản trị viên") {
    // Chuyển hướng về trang chủ hoặc trang thông báo lỗi
    return <Navigate to="/" replace />;
  }

  // Đã đăng nhập và có quyền admin
  return children;
};

// Component bảo vệ route người dùng thông thường
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // Chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    // Kiểm tra token có hợp lệ không (có thể thêm logic kiểm tra token expired)
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Có thể thêm logic kiểm tra token hợp lệ ở đây
        console.log("Đã đăng nhập");
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />


        <Route
          path="/jobs/:id"
          element={

            <JobDetailPage />
          }
        />

        {/* Route yêu cầu quyền admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <ProtectedAdminRoute>
              <AdminCandidatesPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/interviews"
          element={
            <ProtectedAdminRoute>
              <AdminInterviewsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/job-descriptions"
          element={
            <ProtectedAdminRoute>
              <AdminJobDescriptionsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedAdminRoute>
              <AdminReportsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminUsersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/candidates/add"
          element={
            <ProtectedAdminRoute>
              <AdminAddCandidatePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/job-descriptions/add"
          element={
            <ProtectedAdminRoute>
              <AdminAddJobDescriptionPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/potential-emails"
          element={
            <ProtectedAdminRoute>
              <PotentialEmailsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/candidates/:id"
          element={
            <ProtectedAdminRoute>
              <AdminCandidateDetailPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users/add"
          element={
            <ProtectedAdminRoute>
              <AdminAddUsersPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Route mặc định - chuyển hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;