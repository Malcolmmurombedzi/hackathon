import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';

const MyRecords = ({ studentId }) => {
  const [financialData, setFinancialData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchRecords();
    }
  }, [studentId]);

  const fetchRecords = async () => {
    try {
      const [financialsRes, bookingsRes] = await Promise.all([
        studentApi.getFinancials(studentId),
        studentApi.getBookings(studentId)
      ]);
      setFinancialData(financialsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading your records...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-records">
      <h2>My Records</h2>

      {financialData && (
        <div className="student-profile-card">
          <h3>Profile Information</h3>
          <div className="profile-details">
            <p><strong>Name:</strong> {financialData.student.full_name}</p>
            <p><strong>Student ID:</strong> {financialData.student.student_id}</p>
            <p><strong>Form:</strong> {financialData.student.form}</p>
            <p><strong>Date of Birth:</strong> {formatDate(financialData.student.date_of_birth)}</p>
            <p><strong>Address:</strong> {financialData.student.home_address}</p>
          </div>
        </div>
      )}

      <div className="records-section">
        <h3>Fee Payment History</h3>
        {financialData?.financial_records?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Academic Year</th>
                  <th>Total Fee</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {financialData.financial_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.term}</td>
                    <td>{record.academic_year}</td>
                    <td>{formatCurrency(record.total_fee)}</td>
                    <td>{formatCurrency(record.total_paid)}</td>
                    <td className={record.outstanding > 0 ? 'text-danger' : ''}>
                      {formatCurrency(record.outstanding)}
                    </td>
                    <td>
                      <span className={`status-badge ${record.is_paid ? 'paid' : 'pending'}`}>
                        {record.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No fee records found</p>
        )}
      </div>

      <div className="records-section">
        <h3>Hostel Bookings</h3>
        {bookings.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Term</th>
                  <th>Academic Year</th>
                  <th>Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td><strong>{booking.room_number}</strong></td>
                    <td>{booking.term}</td>
                    <td>{booking.academic_year}</td>
                    <td>{formatDate(booking.booking_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No hostel bookings found</p>
        )}
      </div>
    </div>
  );
};

export default MyRecords;
