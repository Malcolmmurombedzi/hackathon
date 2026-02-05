import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Student Management System</h1>
      <div className="portal-cards">
        <div className="portal-card" onClick={() => navigate('/admin/login')}>
          <h2>Admin Portal</h2>
          <p>Manage students, fees, and hostel bookings</p>
          <button className="portal-btn">Enter Admin Portal</button>
        </div>
        <div className="portal-card" onClick={() => navigate('/student/login')}>
          <h2>Student Portal</h2>
          <p>View records, pay fees, and book rooms</p>
          <button className="portal-btn">Enter Student Portal</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
