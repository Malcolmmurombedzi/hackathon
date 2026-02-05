import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';

const BookHostel = ({ studentId }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [feeStatus, setFeeStatus] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId, term, academicYear]);

  const fetchData = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const [roomsRes, bookingsRes, feeStatusRes] = await Promise.all([
        studentApi.getRooms(term, academicYear),
        studentApi.getBookings(studentId),
        studentApi.checkFeePaid(studentId, term, academicYear)
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setFeeStatus(feeStatusRes.data);
    } catch (err) {
      setError('Failed to fetch room information');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (roomId) => {
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      await studentApi.bookRoom({
        student_id: studentId,
        room_id: roomId,
        term,
        academic_year: academicYear
      });
      
      setMessage({ type: 'success', text: 'Room booked successfully!' });
      fetchData(); // Refresh data
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to book room. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasBookingForTerm = () => {
    return bookings.some(
      b => b.term === term && b.academic_year === academicYear
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading room information...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const alreadyBooked = hasBookingForTerm();

  return (
    <div className="book-hostel">
      <h2>Book Hostel Room</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="term-selector">
        <div className="form-group">
          <label htmlFor="term">Term</label>
          <select
            id="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="academicYear">Academic Year</label>
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
      </div>

      {feeStatus && (
        <div className={`fee-status ${feeStatus.is_paid ? 'paid' : 'unpaid'}`}>
          {feeStatus.is_paid ? (
            <p>Fee Status: <strong>Paid</strong> - You can book a room for this term.</p>
          ) : (
            <div>
              <p>Fee Status: <strong>Unpaid</strong></p>
              <p>You need to pay your fees before booking a room.</p>
              <p>Outstanding: {formatCurrency(feeStatus.total_fee - feeStatus.total_paid)}</p>
            </div>
          )}
        </div>
      )}

      {alreadyBooked && (
        <div className="already-booked">
          <p>You have already booked a room for {term} - {academicYear}</p>
        </div>
      )}

      <div className="rooms-grid">
        <h3>Available Rooms</h3>
        {rooms.length === 0 ? (
          <p className="no-data">No rooms available</p>
        ) : (
          <div className="room-cards">
            {rooms.map(room => {
              const available = room.available !== undefined ? room.available : room.capacity;
              const isAvailable = available > 0;
              
              return (
                <div key={room.id} className={`room-card ${!isAvailable ? 'full' : ''}`}>
                  <h4>Room {room.room_number}</h4>
                  <p className="capacity">Capacity: {room.capacity}</p>
                  <p className="availability">
                    Available Beds: <strong>{available}</strong>
                  </p>
                  {room.description && (
                    <p className="description">{room.description}</p>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => handleBookRoom(room.id)}
                    disabled={
                      submitting || 
                      !isAvailable || 
                      !feeStatus?.is_paid || 
                      alreadyBooked
                    }
                  >
                    {!isAvailable 
                      ? 'Full' 
                      : alreadyBooked 
                        ? 'Already Booked'
                        : !feeStatus?.is_paid 
                          ? 'Pay Fees First'
                          : 'Book Room'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookHostel;
