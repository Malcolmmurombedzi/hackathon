import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero">
        <h1>Student Management System</h1>
        <p>Manage student enrollment, fees, and hostel bookings efficiently</p>
      </div>
      
      <div className="login-options">
        <div className="login-card admin-card">
          <div className="card-icon">👨‍💼</div>
          <h2>Admin Portal</h2>
          <p>Manage students, view financial records, and handle hostel rooms</p>
          <Link to="/admin/login" className="btn btn-primary">
            Admin Login
          </Link>
        </div>
        
        <div className="login-card student-card">
          <div className="card-icon">🎓</div>
          <h2>Student Portal</h2>
          <p>Pay fees, book hostel rooms, and view your records</p>
          <Link to="/student/login" className="btn btn-secondary">
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
