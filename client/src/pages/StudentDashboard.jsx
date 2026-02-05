import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { getStudentId, getStudentName, getStudentToken } from "../auth.js";

export function StudentDashboard() {
  const token = getStudentToken();
  const name = getStudentName();
  const studentId = getStudentId();

  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [payTerm, setPayTerm] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMsg, setPayMsg] = useState("");
  const [payError, setPayError] = useState("");

  const [bookTerm, setBookTerm] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsError, setRoomsError] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingError, setBookingError] = useState("");

  async function loadFinancials() {
    setError("");
    setLoading(true);
    try {
      const res = await api("/api/student/me/financials", { token });
      setRecords(res.records || []);
      if (!payTerm && res.records?.length) setPayTerm(res.records[0].termCode);
      if (!bookTerm && res.records?.length) setBookTerm(res.records[0].termCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinancials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const terms = useMemo(() => records.map((r) => ({ code: r.termCode, name: r.termName })), [records]);

  async function submitPayment(e) {
    e.preventDefault();
    setPayMsg("");
    setPayError("");
    try {
      const amount = Number(payAmount);
      if (!payTerm || !amount) throw new Error("Enter term and amount");
      const res = await api("/api/student/payments", { method: "POST", token, body: { termCode: payTerm, amount } });
      setPayMsg(`Payment recorded. Reference: ${res.reference}`);
      setPayAmount("");
      await loadFinancials();
    } catch (err) {
      setPayError(err.message);
    }
  }

  async function loadRoomsForTerm(termCode) {
    setRoomsError("");
    setRooms([]);
    setBookingMsg("");
    setBookingError("");
    try {
      const res = await api(`/api/student/rooms?termCode=${encodeURIComponent(termCode)}`, { token });
      setRooms(res.rooms || []);
    } catch (err) {
      setRoomsError(err.message);
    }
  }

  useEffect(() => {
    if (bookTerm) loadRoomsForTerm(bookTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookTerm]);

  async function bookRoom(roomId) {
    setBookingMsg("");
    setBookingError("");
    try {
      await api("/api/student/bookings", { method: "POST", token, body: { roomId, termCode: bookTerm } });
      setBookingMsg("Booked successfully.");
      await loadRoomsForTerm(bookTerm);
    } catch (err) {
      setBookingError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Student Dashboard</h2>
      <p className="muted">
        Signed in as <b>{name || "Student"}</b> ({studentId})
      </p>

      {error ? <div className="error">{error}</div> : null}

      <div className="section">
        <div className="row">
          <h3 style={{ margin: 0 }}>Financials</h3>
          <div className="spacer" />
          <button className="button subtle" onClick={loadFinancials} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Required</th>
              <th>Paid</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.termCode}>
                <td>
                  {r.termName} ({r.termCode})
                </td>
                <td>{r.requiredFee.toFixed(2)}</td>
                <td>{r.paidFee.toFixed(2)}</td>
                <td>{r.outstandingFee.toFixed(2)}</td>
              </tr>
            ))}
            {!records.length ? (
              <tr>
                <td colSpan={4} className="muted">
                  No terms configured.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid2">
        <div className="section">
          <h3>Pay fees online</h3>
          <form className="form" onSubmit={submitPayment}>
            <label>
              Term
              <select value={payTerm} onChange={(e) => setPayTerm(e.target.value)}>
                {terms.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 500" />
            </label>
            {payError ? <div className="error">{payError}</div> : null}
            {payMsg ? <div className="success">{payMsg}</div> : null}
            <button className="button">Pay</button>
          </form>
          <p className="muted">This demo records a payment entry and updates your term balance.</p>
        </div>

        <div className="section">
          <h3>Hostel booking</h3>
          <label>
            Term
            <select value={bookTerm} onChange={(e) => setBookTerm(e.target.value)}>
              {terms.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </label>
          {roomsError ? <div className="error">{roomsError}</div> : null}
          {bookingError ? <div className="error">{bookingError}</div> : null}
          {bookingMsg ? <div className="success">{bookingMsg}</div> : null}
          <div className="roomlist">
            {rooms.map((r) => (
              <div key={r.id} className="subcard">
                <div className="row">
                  <b>{r.roomCode}</b>
                  <div className="spacer" />
                  <span className="pill">
                    {r.booked}/{r.capacity}
                  </span>
                </div>
                <div className="row">
                  <span className="muted">Available: {r.available}</span>
                  <div className="spacer" />
                  <button className="button" disabled={r.available <= 0} onClick={() => bookRoom(r.id)}>
                    Book
                  </button>
                </div>
              </div>
            ))}
            {!rooms.length ? <p className="muted">No rooms available (or none created yet).</p> : null}
          </div>
          <p className="muted">Booking is only allowed if your fees for the selected term are fully paid.</p>
        </div>
      </div>
    </div>
  );
}

