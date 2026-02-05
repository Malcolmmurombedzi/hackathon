import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EnrollStudent from '../components/admin/EnrollStudent';
import ViewStudents from '../components/admin/ViewStudents';
import FinancialRecords from '../components/admin/FinancialRecords';
import HostelManagement from '../components/admin/HostelManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('enroll');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'enroll':
        return <EnrollStudent />;
      case 'students':
        return <ViewStudents />;
      case 'financials':
        return <FinancialRecords />;
      case 'hostel':
        return <HostelManagement />;
      default:
        return <EnrollStudent />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username || 'Admin'}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul>
            <li>
              <button
                className={activeTab === 'enroll' ? 'active' : ''}
                onClick={() => setActiveTab('enroll')}
              >
                Enroll Student
              </button>
            </li>
            <li>
              <button
                className={activeTab === 'students' ? 'active' : ''}
                onClick={() => setActiveTab('students')}
              >
                View Students
              </button>
            </li>
            <li>
              <button
                className={activeTab === 'financials' ? 'active' : ''}
                onClick={() => setActiveTab('financials')}
              >
                Financial Records
              </button>
            </li>
            <li>
              <button
                className={activeTab === 'hostel' ? 'active' : ''}
                onClick={() => setActiveTab('hostel')}
              >
                Hostel Management
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
