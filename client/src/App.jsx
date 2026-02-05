import { Navigate, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { StudentLogin } from "./pages/StudentLogin.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { StudentDashboard } from "./pages/StudentDashboard.jsx";
import { getAdminToken, getStudentToken, logoutAdmin, logoutStudent } from "./auth.js";

function Home() {
  return (
    <div className="card">
      <h2>Student Management System</h2>
      <p>Choose a portal:</p>
      <div className="row">
        <Link className="button" to="/student/login">
          Student Login
        </Link>
        <Link className="button" to="/admin/login">
          Admin Login
        </Link>
      </div>
    </div>
  );
}

function TopBar() {
  const adminToken = getAdminToken();
  const studentToken = getStudentToken();
  return (
    <div className="topbar">
      <Link to="/" className="brand">
        SMS
      </Link>
      <div className="spacer" />
      {studentToken ? (
        <button className="button subtle" onClick={logoutStudent}>
          Log out student
        </button>
      ) : null}
      {adminToken ? (
        <button className="button subtle" onClick={logoutAdmin}>
          Log out admin
        </button>
      ) : null}
    </div>
  );
}

function AdminGuard({ children }) {
  return getAdminToken() ? children : <Navigate to="/admin/login" replace />;
}

function StudentGuard({ children }) {
  return getStudentToken() ? children : <Navigate to="/student/login" replace />;
}

export default function App() {
  return (
    <>
      <TopBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student"
            element={
              <StudentGuard>
                <StudentDashboard />
              </StudentGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
