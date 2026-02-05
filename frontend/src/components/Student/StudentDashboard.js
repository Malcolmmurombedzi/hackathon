import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    term: ''
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    room_id: '',
    term: ''
  });

  // Data state
  const [financialRecords, setFinancialRecords] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    // Check if student is logged in
    const studentId = sessionStorage.getItem('studentId');
    const storedInfo = sessionStorage.getItem('studentInfo');
    
    if (!studentId || !storedInfo) {
      navigate('/student/login');
    } else {
      setStudentInfo(JSON.parse(storedInfo));
    }
  }, [navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePayFees = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/student/pay-fees`, {
        student_id: studentInfo.student_id,
        amount: parseFloat(paymentForm.amount),
        term: paymentForm.term
      });
      showMessage('success', 'Payment successful!');
      setPaymentForm({ amount: '', term: '' });
      fetchFinancialRecords();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Payment failed');
    }
    setLoading(false);
  };

  const fetchFinancialRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/${studentInfo.student_id}/financial-records`
      );
      setFinancialRecords(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch financial records');
    }
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/${studentInfo.student_id}/bookings`
      );
      setMyBookings(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch bookings');
    }
    setLoading(false);
  };

  const fetchAvailableRooms = async (term) => {
    if (!term) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/rooms/available?term=${term}`
      );
      setAvailableRooms(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch available rooms');
    }
    setLoading(false);
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/student/book-room`, {
        student_id: studentInfo.student_id,
        room_id: parseInt(bookingForm.room_id),
        term: bookingForm.term
      });
      showMessage('success', 'Room booked successfully!');
      setBookingForm({ room_id: '', term: '' });
      setAvailableRooms([]);
      fetchMyBookings();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Booking failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (studentInfo) {
      if (activeTab === 'financial') {
        fetchFinancialRecords();
      } else if (activeTab === 'bookings') {
        fetchMyBookings();
      }
    }
  }, [activeTab, studentInfo]);

  useEffect(() => {
    if (bookingForm.term) {
      fetchAvailableRooms(bookingForm.term);
    }
  }, [bookingForm.term]);

  const handleLogout = () => {
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('studentInfo');
    navigate('/');
  };

  if (!studentInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="nav-header">
        <h1>Student Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}

        <div className="nav-links" style={{ marginBottom: '2rem' }}>
          <button className="nav-btn" onClick={() => setActiveTab('home')}>Home</button>
          <button className="nav-btn" onClick={() => setActiveTab('payFees')}>Pay Fees</button>
          <button className="nav-btn" onClick={() => setActiveTab('financial')}>Financial Records</button>
          <button className="nav-btn" onClick={() => setActiveTab('bookRoom')}>Book Room</button>
          <button className="nav-btn" onClick={() => setActiveTab('bookings')}>My Bookings</button>
        </div>

        {activeTab === 'home' && (
          <div className="card">
            <h2>Welcome, {studentInfo.full_name}!</h2>
            <div className="stats-grid" style={{ marginTop: '2rem' }}>
              <div className="stat-card">
                <h3>{studentInfo.student_id}</h3>
                <p>Student ID</p>
              </div>
              <div className="stat-card">
                <h3>{studentInfo.form}</h3>
                <p>Current Form</p>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <p><strong>Date of Birth:</strong> {new Date(studentInfo.date_of_birth).toLocaleDateString()}</p>
              <p><strong>Address:</strong> {studentInfo.home_address}</p>
            </div>
          </div>
        )}

        {activeTab === 'payFees' && (
          <div className="card">
            <h2>Pay Fees</h2>
            <form onSubmit={handlePayFees}>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Term *</label>
                <select
                  value={paymentForm.term}
                  onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                  required
                >
                  <option value="">Select Term</option>
                  <option value="Term 1 2024">Term 1 2024</option>
                  <option value="Term 2 2024">Term 2 2024</option>
                  <option value="Term 3 2024">Term 3 2024</option>
                  <option value="Term 1 2025">Term 1 2025</option>
                  <option value="Term 2 2025">Term 2 2025</option>
                  <option value="Term 3 2025">Term 3 2025</option>
                </select>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Processing...' : 'Pay Fees'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="card">
            <h2>Financial Records</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : financialRecords ? (
              <div>
                <div className="stat-card" style={{ marginBottom: '2rem' }}>
                  <h3>${financialRecords.total_paid}</h3>
                  <p>Total Paid</p>
                </div>

                <h3>Payment History</h3>
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
                      {financialRecords.payments.length > 0 ? (
                        financialRecords.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>${payment.amount}</td>
                            <td>{payment.term}</td>
                            <td>{new Date(payment.payment_date).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center' }}>No payments yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>No financial records found.</p>
            )}
          </div>
        )}

        {activeTab === 'bookRoom' && (
          <div className="card">
            <h2>Book Hostel Room</h2>
            <form onSubmit={handleBookRoom}>
              <div className="form-group">
                <label>Term *</label>
                <select
                  value={bookingForm.term}
                  onChange={(e) => setBookingForm({ ...bookingForm, term: e.target.value, room_id: '' })}
                  required
                >
                  <option value="">Select Term</option>
                  <option value="Term 1 2024">Term 1 2024</option>
                  <option value="Term 2 2024">Term 2 2024</option>
                  <option value="Term 3 2024">Term 3 2024</option>
                  <option value="Term 1 2025">Term 1 2025</option>
                  <option value="Term 2 2025">Term 2 2025</option>
                  <option value="Term 3 2025">Term 3 2025</option>
                </select>
              </div>

              {bookingForm.term && (
                <div>
                  <h3>Available Rooms</h3>
                  {loading ? (
                    <div className="loading">Loading rooms...</div>
                  ) : availableRooms.length > 0 ? (
                    <div className="room-grid">
                      {availableRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`room-card ${bookingForm.room_id === room.id.toString() ? 'selected' : ''}`}
                          onClick={() => setBookingForm({ ...bookingForm, room_id: room.id.toString() })}
                        >
                          <h3>Room {room.room_number}</h3>
                          <p className="room-info">Capacity: {room.capacity}</p>
                          <p className="room-info">Available: {room.available_spaces}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No rooms available for this term.</p>
                  )}
                </div>
              )}

              {bookingForm.room_id && (
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? 'Booking...' : 'Book Room'}
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card">
            <h2>My Bookings</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Term</th>
                      <th>Booking Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.length > 0 ? (
                      myBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.room_number}</td>
                          <td>{booking.term}</td>
                          <td>{new Date(booking.booking_date).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>No bookings yet</td>
                      </tr>
                    )}
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

export default StudentDashboard;
