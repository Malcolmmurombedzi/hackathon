import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PayFees from '../components/student/PayFees';
import BookHostel from '../components/student/BookHostel';
import MyRecords from '../components/student/MyRecords';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('records');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'records':
        return <MyRecords studentId={user?.student_id} />;
      case 'pay-fees':
        return <PayFees studentId={user?.student_id} />;
      case 'book-hostel':
        return <BookHostel studentId={user?.student_id} />;
      default:
        return <MyRecords studentId={user?.student_id} />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header student-header">
        <h1>Student Portal</h1>
        <div className="user-info">
          <span>Welcome, {user?.full_name}</span>
          <span className="student-id">ID: {user?.student_id}</span>
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
                className={activeTab === 'records' ? 'active' : ''}
                onClick={() => setActiveTab('records')}
              >
                My Records
              </button>
            </li>
            <li>
              <button
                className={activeTab === 'pay-fees' ? 'active' : ''}
                onClick={() => setActiveTab('pay-fees')}
              >
                Pay Fees
              </button>
            </li>
            <li>
              <button
                className={activeTab === 'book-hostel' ? 'active' : ''}
                onClick={() => setActiveTab('book-hostel')}
              >
                Book Hostel
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

export default StudentDashboard;
