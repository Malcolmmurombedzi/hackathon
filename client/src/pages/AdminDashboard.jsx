import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { getAdminToken } from "../auth.js";

function TabButton({ active, onClick, children }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function AdminDashboard() {
  const token = getAdminToken();
  const [tab, setTab] = useState("enroll");

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <TabButton active={tab === "enroll"} onClick={() => setTab("enroll")}>
          Enroll student
        </TabButton>
        <TabButton active={tab === "financials"} onClick={() => setTab("financials")}>
          Financial records
        </TabButton>
        <TabButton active={tab === "hostel"} onClick={() => setTab("hostel")}>
          Hostel
        </TabButton>
      </div>

      {tab === "enroll" ? <EnrollStudent token={token} /> : null}
      {tab === "financials" ? <StudentFinancials token={token} /> : null}
      {tab === "hostel" ? <HostelAdmin token={token} /> : null}
    </div>
  );
}

function EnrollStudent({ token }) {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [form, setForm] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setCreated(null);
    setLoading(true);
    try {
      const res = await api("/api/admin/students", {
        method: "POST",
        token,
        body: { fullName, dateOfBirth, homeAddress, form },
      });
      setCreated(res);
      setFullName("");
      setDateOfBirth("");
      setHomeAddress("");
      setForm("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h3>Student Enrollment</h3>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          Date of birth
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </label>
        <label>
          Home address
          <input value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
        </label>
        <label>
          Form
          <input value={form} onChange={(e) => setForm(e.target.value)} placeholder="e.g. Form 1" />
        </label>
        {error ? <div className="error">{error}</div> : null}
        {created ? (
          <div className="success">
            Enrolled. Student ID: <b>{created.studentId}</b>
          </div>
        ) : null}
        <button className="button" disabled={loading}>
          {loading ? "Saving..." : "Enroll student"}
        </button>
      </form>
    </div>
  );
}

function StudentFinancials({ token }) {
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSearch(e) {
    e.preventDefault();
    setError("");
    setData(null);
    setLoading(true);
    try {
      const res = await api(`/api/admin/students/${encodeURIComponent(studentId)}/financials`, { token });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h3>Financial Records</h3>
      <form className="row" onSubmit={onSearch}>
        <input value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} placeholder="Student ID" maxLength={8} />
        <button className="button" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>
      {error ? <div className="error">{error}</div> : null}
      {data ? (
        <>
          <p className="muted">
            Student: <b>{data.student.fullName}</b> ({data.student.studentId})
          </p>
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
              {data.records.map((r) => (
                <tr key={r.termCode}>
                  <td>
                    {r.termName} ({r.termCode})
                  </td>
                  <td>{r.requiredFee.toFixed(2)}</td>
                  <td>{r.paidFee.toFixed(2)}</td>
                  <td>{r.outstandingFee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}

function HostelAdmin({ token }) {
  const [roomCode, setRoomCode] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [createError, setCreateError] = useState("");
  const [createOk, setCreateOk] = useState("");

  const [bookings, setBookings] = useState([]);
  const [bookingsError, setBookingsError] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);

  async function createRoom(e) {
    e.preventDefault();
    setCreateError("");
    setCreateOk("");
    try {
      await api("/api/admin/rooms", { method: "POST", token, body: { roomCode, capacity: Number(capacity) } });
      setCreateOk("Room created.");
      setRoomCode("");
      await loadBookings();
    } catch (err) {
      setCreateError(err.message);
    }
  }

  async function loadBookings() {
    setBookingsError("");
    setLoadingBookings(true);
    try {
      const res = await api("/api/admin/bookings", { token });
      setBookings(res.bookings || []);
    } catch (err) {
      setBookingsError(err.message);
    } finally {
      setLoadingBookings(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      const key = `${b.term_code}__${b.room_code}`;
      if (!map.has(key)) map.set(key, { termCode: b.term_code, roomCode: b.room_code, capacity: b.capacity, items: [] });
      map.get(key).items.push(b);
    }
    return Array.from(map.values());
  }, [bookings]);

  return (
    <div className="section">
      <h3>Hostel Management</h3>
      <div className="grid2">
        <div>
          <h4>Create room</h4>
          <form className="form" onSubmit={createRoom}>
            <label>
              Room code
              <input value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="e.g. A-101" />
            </label>
            <label>
              Capacity
              <input type="number" min={1} max={20} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </label>
            {createError ? <div className="error">{createError}</div> : null}
            {createOk ? <div className="success">{createOk}</div> : null}
            <button className="button">Create</button>
          </form>
        </div>
        <div>
          <div className="row">
            <h4 style={{ margin: 0 }}>Room bookings</h4>
            <div className="spacer" />
            <button className="button subtle" onClick={loadBookings} disabled={loadingBookings}>
              {loadingBookings ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {bookingsError ? <div className="error">{bookingsError}</div> : null}
          {!grouped.length ? <p className="muted">No bookings yet.</p> : null}
          {grouped.map((g) => (
            <div key={`${g.termCode}-${g.roomCode}`} className="subcard">
              <div className="row">
                <b>
                  {g.roomCode} — {g.termCode}
                </b>
                <div className="spacer" />
                <span className="pill">
                  {g.items.length}/{g.capacity}
                </span>
              </div>
              <ul className="list">
                {g.items.map((b) => (
                  <li key={b.id}>
                    {b.full_name} ({b.student_id})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

