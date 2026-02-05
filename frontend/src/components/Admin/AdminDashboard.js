import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enroll');
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Enrollment form state
  const [enrollForm, setEnrollForm] = useState({
    full_name: '',
    date_of_birth: '',
    home_address: '',
    form: ''
  });

  // Room form state
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    capacity: ''
  });

  // Financial records state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [financialRecords, setFinancialRecords] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const username = sessionStorage.getItem('adminUsername');
    const password = sessionStorage.getItem('adminPassword');
    if (!username || !password) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const getAuthHeaders = () => {
    return {
      username: sessionStorage.getItem('adminUsername'),
      password: sessionStorage.getItem('adminPassword')
    };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/students/enroll`,
        enrollForm,
        { headers: getAuthHeaders() }
      );
      showMessage('success', `Student enrolled successfully! Student ID: ${response.data.student_id}`);
      setEnrollForm({ full_name: '', date_of_birth: '', home_address: '', form: '' });
      fetchStudents();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to enroll student');
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/students`, {
        headers: getAuthHeaders()
      });
      setStudents(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch students');
    }
    setLoading(false);
  };

  const fetchFinancialRecords = async () => {
    if (!selectedStudentId) {
      showMessage('error', 'Please enter a student ID');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/students/${selectedStudentId}/financial-records`,
        { headers: getAuthHeaders() }
      );
      setFinancialRecords(response.data);
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to fetch financial records');
    }
    setLoading(false);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/rooms`,
        roomForm,
        { headers: getAuthHeaders() }
      );
      showMessage('success', 'Room created successfully!');
      setRoomForm({ room_number: '', capacity: '' });
      fetchRooms();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to create room');
    }
    setLoading(false);
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/rooms`, {
        headers: getAuthHeaders()
      });
      setRooms(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch rooms');
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
        headers: getAuthHeaders()
      });
      setBookings(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch bookings');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'rooms') {
      fetchRooms();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminPassword');
    navigate('/');
  };

  return (
    <div>
      <div className="nav-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}

        <div className="nav-links" style={{ marginBottom: '2rem' }}>
          <button className="nav-btn" onClick={() => setActiveTab('enroll')}>Enroll Student</button>
          <button className="nav-btn" onClick={() => setActiveTab('students')}>View Students</button>
          <button className="nav-btn" onClick={() => setActiveTab('financial')}>Financial Records</button>
          <button className="nav-btn" onClick={() => setActiveTab('createRoom')}>Create Room</button>
          <button className="nav-btn" onClick={() => setActiveTab('rooms')}>View Rooms</button>
          <button className="nav-btn" onClick={() => setActiveTab('bookings')}>View Bookings</button>
        </div>

        {activeTab === 'enroll' && (
          <div className="card">
            <h2>Enroll New Student</h2>
            <form onSubmit={handleEnrollStudent}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={enrollForm.full_name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={enrollForm.date_of_birth}
                  onChange={(e) => setEnrollForm({ ...enrollForm, date_of_birth: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Home Address *</label>
                <input
                  type="text"
                  value={enrollForm.home_address}
                  onChange={(e) => setEnrollForm({ ...enrollForm, home_address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Form *</label>
                <select
                  value={enrollForm.form}
                  onChange={(e) => setEnrollForm({ ...enrollForm, form: e.target.value })}
                  required
                >
                  <option value="">Select Form</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="card">
            <h2>All Students</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Date of Birth</th>
                      <th>Form</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.student_id}</td>
                        <td>{student.full_name}</td>
                        <td>{new Date(student.date_of_birth).toLocaleDateString()}</td>
                        <td>{student.form}</td>
                        <td>{student.home_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="card">
            <h2>Student Financial Records</h2>
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                placeholder="Enter student ID"
              />
            </div>
            <button className="btn" onClick={fetchFinancialRecords} disabled={loading}>
              {loading ? 'Loading...' : 'Get Financial Records'}
            </button>

            {financialRecords && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Student: {financialRecords.student.full_name}</h3>
                <p>Total Paid: ${financialRecords.total_paid}</p>
                <p>Terms Paid: {financialRecords.terms_paid.join(', ') || 'None'}</p>

                <h3 style={{ marginTop: '2rem' }}>Payment History</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Term</th>
                        <th>Payment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialRecords.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>${payment.amount}</td>
                          <td>{payment.term}</td>
                          <td>{new Date(payment.payment_date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'createRoom' && (
          <div className="card">
            <h2>Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={roomForm.room_number}
                  onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="card">
            <h2>All Rooms</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Capacity</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td>{room.room_number}</td>
                        <td>{room.capacity}</td>
                        <td>{new Date(room.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card">
            <h2>All Room Bookings</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Room Number</th>
                      <th>Term</th>
                      <th>Booking Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.student_id}</td>
                        <td>{booking.full_name}</td>
                        <td>{booking.room_number}</td>
                        <td>{booking.term}</td>
                        <td>{new Date(booking.booking_date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
