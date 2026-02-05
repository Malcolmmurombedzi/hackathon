import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const HostelManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New room form
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    capacity: '',
    description: ''
  });

  // Filters
  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  useEffect(() => {
    fetchData();
  }, [term, academicYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        adminApi.getAllRooms(term, academicYear),
        adminApi.getAllBookings()
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await adminApi.createRoom({
        room_number: newRoom.room_number,
        capacity: parseInt(newRoom.capacity),
        description: newRoom.description
      });
      setMessage({ type: 'success', text: 'Room created successfully!' });
      setNewRoom({ room_number: '', capacity: '', description: '' });
      fetchData();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to create room' 
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="hostel-management">
      <h2>Hostel Management</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="sub-tabs">
        <button
          className={activeSubTab === 'rooms' ? 'active' : ''}
          onClick={() => setActiveSubTab('rooms')}
        >
          Manage Rooms
        </button>
        <button
          className={activeSubTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveSubTab('bookings')}
        >
          View Bookings
        </button>
      </div>

      {activeSubTab === 'rooms' && (
        <div className="rooms-section">
          <div className="add-room-form">
            <h3>Add New Room</h3>
            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleCreateRoom}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="room_number">Room Number</label>
                  <input
                    type="text"
                    id="room_number"
                    value={newRoom.room_number}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, room_number: e.target.value }))}
                    required
                    placeholder="e.g., A101"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    type="number"
                    id="capacity"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: e.target.value }))}
                    required
                    placeholder="e.g., 4"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Ground floor, AC room"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Room
              </button>
            </form>
          </div>

          <div className="rooms-list">
            <h3>All Rooms</h3>
            <div className="filters">
              <select value={term} onChange={(e) => setTerm(e.target.value)}>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            {rooms.length === 0 ? (
              <div className="no-data">No rooms created yet</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room Number</th>
                      <th>Capacity</th>
                      <th>Booked</th>
                      <th>Available</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room.id}>
                        <td><strong>{room.room_number}</strong></td>
                        <td>{room.capacity}</td>
                        <td>{room.booked || 0}</td>
                        <td className={room.available === 0 ? 'text-danger' : 'text-success'}>
                          {room.available !== undefined ? room.available : room.capacity}
                        </td>
                        <td>{room.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'bookings' && (
        <div className="bookings-section">
          <h3>Room Bookings</h3>
          {bookings.length === 0 ? (
            <div className="no-data">No bookings yet</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Room Number</th>
                    <th>Term</th>
                    <th>Academic Year</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td><strong>{booking.student_id}</strong></td>
                      <td>{booking.full_name}</td>
                      <td>{booking.room_number}</td>
                      <td>{booking.term}</td>
                      <td>{booking.academic_year}</td>
                      <td>{formatDate(booking.booking_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostelManagement;
