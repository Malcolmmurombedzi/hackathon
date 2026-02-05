import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
};

const formatCurrency = (value) => {
  if (Number.isNaN(Number(value))) {
    return "0.00";
  }
  return Number(value).toFixed(2);
};

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsTerm, setBookingsTerm] = useState("");
  const [bookingFilterError, setBookingFilterError] = useState("");

  const [enrollment, setEnrollment] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    form: "",
  });
  const [enrollmentResult, setEnrollmentResult] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState("");

  const [feeSchedule, setFeeSchedule] = useState({
    studentId: "",
    term: "",
    amountDue: "",
  });
  const [feeScheduleMessage, setFeeScheduleMessage] = useState("");
  const [feeScheduleError, setFeeScheduleError] = useState("");

  const [financialLookup, setFinancialLookup] = useState({ studentId: "" });
  const [financialRecord, setFinancialRecord] = useState(null);
  const [financialError, setFinancialError] = useState("");

  const [roomForm, setRoomForm] = useState({ name: "", capacity: "" });
  const [roomMessage, setRoomMessage] = useState("");
  const [roomError, setRoomError] = useState("");

  const [loginId, setLoginId] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loginError, setLoginError] = useState("");

  const [paymentForm, setPaymentForm] = useState({ term: "", amount: "" });
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [hostelForm, setHostelForm] = useState({ term: "", roomId: "" });
  const [hostelMessage, setHostelMessage] = useState("");
  const [hostelError, setHostelError] = useState("");

  const loadRooms = async () => {
    try {
      const data = await request("/api/rooms");
      setRooms(data.rooms || []);
    } catch (error) {
      setRoomError(error.message);
    }
  };

  const loadBookings = async (termValue = "") => {
    try {
      setBookingFilterError("");
      const query = termValue ? `?term=${encodeURIComponent(termValue)}` : "";
      const data = await request(`/api/bookings${query}`);
      setBookings(data.bookings || []);
    } catch (error) {
      setBookingFilterError(error.message);
    }
  };

  useEffect(() => {
    loadRooms();
    loadBookings();
  }, []);

  const handleEnroll = async (event) => {
    event.preventDefault();
    setEnrollmentError("");
    setEnrollmentResult(null);
    try {
      const data = await request("/api/students", {
        method: "POST",
        body: JSON.stringify({
          fullName: enrollment.fullName,
          dateOfBirth: enrollment.dateOfBirth,
          address: enrollment.address,
          form: enrollment.form,
        }),
      });
      setEnrollmentResult(data);
      setEnrollment({
        fullName: "",
        dateOfBirth: "",
        address: "",
        form: "",
      });
    } catch (error) {
      setEnrollmentError(error.message);
    }
  };

  const handleFeeSchedule = async (event) => {
    event.preventDefault();
    setFeeScheduleMessage("");
    setFeeScheduleError("");
    try {
      const data = await request(
        `/api/students/${feeSchedule.studentId}/fees`,
        {
          method: "POST",
          body: JSON.stringify({
            term: feeSchedule.term,
            amountDue: feeSchedule.amountDue,
          }),
        }
      );
      setFeeScheduleMessage(
        `Fee schedule saved. Due: ${formatCurrency(
          data.amountDue
        )} | Paid: ${formatCurrency(data.amountPaid)}`
      );
      setFeeSchedule({ studentId: "", term: "", amountDue: "" });
    } catch (error) {
      setFeeScheduleError(error.message);
    }
  };

  const handleFinancialLookup = async (event) => {
    event.preventDefault();
    setFinancialError("");
    setFinancialRecord(null);
    try {
      const data = await request(
        `/api/students/${financialLookup.studentId}/financial`
      );
      setFinancialRecord(data);
    } catch (error) {
      setFinancialError(error.message);
    }
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setRoomMessage("");
    setRoomError("");
    try {
      const data = await request("/api/rooms", {
        method: "POST",
        body: JSON.stringify({
          name: roomForm.name,
          capacity: Number(roomForm.capacity),
        }),
      });
      setRoomMessage(`Room created: ${data.name} (ID ${data.id})`);
      setRoomForm({ name: "", capacity: "" });
      await loadRooms();
    } catch (error) {
      setRoomError(error.message);
    }
  };

  const handleBookingsFilter = async (event) => {
    event.preventDefault();
    await loadBookings(bookingsTerm);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setCurrentStudent(null);
    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ studentId: loginId }),
      });
      setCurrentStudent(data);
      setPaymentForm({ term: "", amount: "" });
      setHostelForm({ term: "", roomId: "" });
      setLoginId("");
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!currentStudent) {
      return;
    }
    setPaymentMessage("");
    setPaymentError("");
    try {
      const data = await request(
        `/api/students/${currentStudent.studentId}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            term: paymentForm.term,
            amount: paymentForm.amount,
          }),
        }
      );
      setPaymentMessage(
        `Payment recorded. Outstanding: ${formatCurrency(data.outstanding)}`
      );
      setPaymentForm({ term: "", amount: "" });
      await loadBookings(bookingsTerm);
    } catch (error) {
      setPaymentError(error.message);
    }
  };

  const handleHostelBooking = async (event) => {
    event.preventDefault();
    if (!currentStudent) {
      return;
    }
    setHostelMessage("");
    setHostelError("");
    try {
      const data = await request("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          studentId: currentStudent.studentId,
          roomId: hostelForm.roomId,
          term: hostelForm.term,
        }),
      });
      setHostelMessage(`Booking confirmed (ID ${data.bookingId}).`);
      setHostelForm({ term: "", roomId: "" });
      await loadBookings(bookingsTerm);
    } catch (error) {
      setHostelError(error.message);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>Student Management System</h1>
          <p className="small">
            Manage enrollment, fees, and hostel bookings from one dashboard.
          </p>
        </div>
        <span className="badge">API: {API_BASE_URL}</span>
      </header>

      <section className="panel">
        <h2 className="section-title">Admin Portal</h2>
        <div className="section-grid">
          <div className="card">
            <h3>Student Enrollment</h3>
            <form className="form" onSubmit={handleEnroll}>
              <label>
                Full name
                <input
                  type="text"
                  value={enrollment.fullName}
                  onChange={(event) =>
                    setEnrollment({ ...enrollment, fullName: event.target.value })
                  }
                />
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={enrollment.dateOfBirth}
                  onChange={(event) =>
                    setEnrollment({
                      ...enrollment,
                      dateOfBirth: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Home address
                <textarea
                  value={enrollment.address}
                  onChange={(event) =>
                    setEnrollment({ ...enrollment, address: event.target.value })
                  }
                />
              </label>
              <label>
                Form enrolled
                <input
                  type="text"
                  value={enrollment.form}
                  onChange={(event) =>
                    setEnrollment({ ...enrollment, form: event.target.value })
                  }
                />
              </label>
              <button type="submit">Enroll student</button>
              {enrollmentError ? (
                <p className="status error">{enrollmentError}</p>
              ) : null}
              {enrollmentResult ? (
                <p className="status success">
                  Student ID: <strong>{enrollmentResult.studentId}</strong>
                </p>
              ) : null}
            </form>
          </div>

          <div className="card">
            <h3>Set Term Fees</h3>
            <form className="form" onSubmit={handleFeeSchedule}>
              <label>
                Student ID
                <input
                  type="text"
                  value={feeSchedule.studentId}
                  onChange={(event) =>
                    setFeeSchedule({
                      ...feeSchedule,
                      studentId: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Term
                <input
                  type="text"
                  value={feeSchedule.term}
                  onChange={(event) =>
                    setFeeSchedule({ ...feeSchedule, term: event.target.value })
                  }
                />
              </label>
              <label>
                Amount due
                <input
                  type="number"
                  step="0.01"
                  value={feeSchedule.amountDue}
                  onChange={(event) =>
                    setFeeSchedule({
                      ...feeSchedule,
                      amountDue: event.target.value,
                    })
                  }
                />
              </label>
              <button type="submit">Save fee schedule</button>
              {feeScheduleError ? (
                <p className="status error">{feeScheduleError}</p>
              ) : null}
              {feeScheduleMessage ? (
                <p className="status success">{feeScheduleMessage}</p>
              ) : null}
            </form>
          </div>

          <div className="card">
            <h3>Financial Records</h3>
            <form className="form" onSubmit={handleFinancialLookup}>
              <label>
                Student ID
                <input
                  type="text"
                  value={financialLookup.studentId}
                  onChange={(event) =>
                    setFinancialLookup({ studentId: event.target.value })
                  }
                />
              </label>
              <button type="submit">View records</button>
              {financialError ? (
                <p className="status error">{financialError}</p>
              ) : null}
            </form>
            {financialRecord ? (
              <div className="list">
                <div className="list-item">
                  <strong>{financialRecord.student.fullName}</strong>
                  <div className="small">
                    Student ID: {financialRecord.student.studentId}
                  </div>
                  <div className="small">
                    Total outstanding:{" "}
                    {formatCurrency(financialRecord.totalOutstanding)}
                  </div>
                </div>
                {financialRecord.fees.map((fee) => (
                  <div className="list-item" key={`${fee.term}-fee`}>
                    <strong>{fee.term}</strong>
                    <div className="small">
                      Due: {formatCurrency(fee.amountDue)} | Paid:{" "}
                      {formatCurrency(fee.amountPaid)} | Outstanding:{" "}
                      {formatCurrency(fee.outstanding)}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Hostel Management</h2>
        <div className="section-grid">
          <div className="card">
            <h3>Create Rooms</h3>
            <form className="form" onSubmit={handleCreateRoom}>
              <label>
                Room name
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, name: event.target.value })
                  }
                />
              </label>
              <label>
                Capacity
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, capacity: event.target.value })
                  }
                />
              </label>
              <button type="submit">Add room</button>
              {roomError ? <p className="status error">{roomError}</p> : null}
              {roomMessage ? (
                <p className="status success">{roomMessage}</p>
              ) : null}
            </form>
          </div>

          <div className="card">
            <h3>Available Rooms</h3>
            <div className="list">
              {rooms.length === 0 ? (
                <p className="small">No rooms created yet.</p>
              ) : (
                rooms.map((room) => (
                  <div className="list-item" key={room.id}>
                    <strong>{room.name}</strong>
                    <div className="small">
                      ID: {room.id} | Capacity: {room.capacity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3>Room Bookings</h3>
            <form className="form" onSubmit={handleBookingsFilter}>
              <label>
                Filter by term
                <input
                  type="text"
                  value={bookingsTerm}
                  onChange={(event) => setBookingsTerm(event.target.value)}
                />
              </label>
              <button type="submit">Load bookings</button>
              {bookingFilterError ? (
                <p className="status error">{bookingFilterError}</p>
              ) : null}
            </form>
            <div className="list">
              {bookings.length === 0 ? (
                <p className="small">No bookings yet.</p>
              ) : (
                bookings.map((booking) => (
                  <div className="list-item" key={booking.id}>
                    <strong>
                      {booking.student.fullName} ({booking.student.studentId})
                    </strong>
                    <div className="small">
                      Term: {booking.term} | Room: {booking.room.name} (ID{" "}
                      {booking.room.id})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Student Portal</h2>
        <div className="section-grid">
          <div className="card">
            <h3>Login</h3>
            <form className="form" onSubmit={handleLogin}>
              <label>
                Student ID
                <input
                  type="text"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                />
              </label>
              <button type="submit">Login</button>
              {loginError ? <p className="status error">{loginError}</p> : null}
            </form>
            {currentStudent ? (
              <p className="status success">
                Welcome, {currentStudent.fullName} (Form: {currentStudent.form})
              </p>
            ) : null}
          </div>

          <div className="card">
            <h3>Pay Fees</h3>
            <form className="form" onSubmit={handlePayment}>
              <label>
                Term
                <input
                  type="text"
                  value={paymentForm.term}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, term: event.target.value })
                  }
                  disabled={!currentStudent}
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: event.target.value,
                    })
                  }
                  disabled={!currentStudent}
                />
              </label>
              <button type="submit" disabled={!currentStudent}>
                Submit payment
              </button>
              {paymentError ? (
                <p className="status error">{paymentError}</p>
              ) : null}
              {paymentMessage ? (
                <p className="status success">{paymentMessage}</p>
              ) : null}
            </form>
          </div>

          <div className="card">
            <h3>Book Hostel Room</h3>
            <form className="form" onSubmit={handleHostelBooking}>
              <label>
                Term
                <input
                  type="text"
                  value={hostelForm.term}
                  onChange={(event) =>
                    setHostelForm({ ...hostelForm, term: event.target.value })
                  }
                  disabled={!currentStudent}
                />
              </label>
              <label>
                Room
                <select
                  value={hostelForm.roomId}
                  onChange={(event) =>
                    setHostelForm({ ...hostelForm, roomId: event.target.value })
                  }
                  disabled={!currentStudent}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} (ID {room.id})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={!currentStudent}>
                Book room
              </button>
              {hostelError ? (
                <p className="status error">{hostelError}</p>
              ) : null}
              {hostelMessage ? (
                <p className="status success">{hostelMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
