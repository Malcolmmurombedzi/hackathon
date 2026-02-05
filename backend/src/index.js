import crypto from "crypto";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ID_LENGTH = 8;
const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Number(amount.toFixed(2));
};

const generateStudentId = () => {
  let id = "";
  for (let i = 0; i < ID_LENGTH; i += 1) {
    const index = crypto.randomInt(0, ID_CHARS.length);
    id += ID_CHARS[index];
  }
  return id;
};

const getStudentByPublicId = async (studentId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT id, student_id, full_name, date_of_birth, address, form_enrolled, created_at
     FROM students
     WHERE student_id = ?`,
    [studentId]
  );
  return rows[0] ?? null;
};

const createUniqueStudentId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateStudentId();
    const [rows] = await pool.query(
      "SELECT id FROM students WHERE student_id = ?",
      [candidate]
    );
    if (rows.length === 0) {
      return candidate;
    }
  }
  throw new Error("Unable to generate unique student ID.");
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!isNonEmptyString(studentId)) {
      return res.status(400).json({ error: "Student ID is required." });
    }

    const student = await getStudentByPublicId(studentId.trim());
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    res.json({
      studentId: student.student_id,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth,
      address: student.address,
      form: student.form_enrolled,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
  try {
    const { fullName, dateOfBirth, address, form } = req.body;
    if (
      !isNonEmptyString(fullName) ||
      !isNonEmptyString(dateOfBirth) ||
      !isNonEmptyString(address) ||
      !isNonEmptyString(form)
    ) {
      return res.status(400).json({
        error:
          "Full name, date of birth, address, and form are required fields.",
      });
    }

    const studentId = await createUniqueStudentId();
    const [result] = await pool.query(
      `INSERT INTO students (student_id, full_name, date_of_birth, address, form_enrolled)
       VALUES (?, ?, ?, ?, ?)`,
      [
        studentId,
        fullName.trim(),
        dateOfBirth.trim(),
        address.trim(),
        form.trim(),
      ]
    );

    res.status(201).json({
      id: result.insertId,
      studentId,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      address: address.trim(),
      form: form.trim(),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students/:studentId/fees", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, amountDue } = req.body;

    if (!isNonEmptyString(term)) {
      return res.status(400).json({ error: "Term is required." });
    }

    const normalizedDue = normalizeAmount(amountDue);
    if (!normalizedDue) {
      return res
        .status(400)
        .json({ error: "Amount due must be a positive number." });
    }

    const student = await getStudentByPublicId(studentId.trim());
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    await pool.query(
      `INSERT INTO student_fees (student_id, term, amount_due, amount_paid)
       VALUES (?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE amount_due = VALUES(amount_due)`,
      [student.id, term.trim(), normalizedDue]
    );

    const [fees] = await pool.query(
      `SELECT term, amount_due, amount_paid
       FROM student_fees
       WHERE student_id = ? AND term = ?`,
      [student.id, term.trim()]
    );

    res.json({
      studentId: student.student_id,
      term: fees[0].term,
      amountDue: Number(fees[0].amount_due),
      amountPaid: Number(fees[0].amount_paid),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students/:studentId/payments", async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { studentId } = req.params;
    const { term, amount } = req.body;

    if (!isNonEmptyString(term)) {
      return res.status(400).json({ error: "Term is required." });
    }

    const normalizedAmount = normalizeAmount(amount);
    if (!normalizedAmount) {
      return res
        .status(400)
        .json({ error: "Payment amount must be a positive number." });
    }

    await connection.beginTransaction();

    const student = await getStudentByPublicId(studentId.trim(), connection);
    if (!student) {
      await connection.rollback();
      return res.status(404).json({ error: "Student not found." });
    }

    const [feeRows] = await connection.query(
      `SELECT id, amount_due, amount_paid
       FROM student_fees
       WHERE student_id = ? AND term = ?
       FOR UPDATE`,
      [student.id, term.trim()]
    );

    if (feeRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "No fee schedule found for this term. Ask admin to set fees.",
      });
    }

    const fee = feeRows[0];
    const newPaid = Number((fee.amount_paid + normalizedAmount).toFixed(2));

    await connection.query(
      "UPDATE student_fees SET amount_paid = ? WHERE id = ?",
      [newPaid, fee.id]
    );

    await connection.query(
      "INSERT INTO payments (student_id, term, amount) VALUES (?, ?, ?)",
      [student.id, term.trim(), normalizedAmount]
    );

    await connection.commit();

    res.status(201).json({
      studentId: student.student_id,
      term: term.trim(),
      amountDue: Number(fee.amount_due),
      amountPaid: newPaid,
      outstanding: Number((fee.amount_due - newPaid).toFixed(2)),
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.get("/api/students/:studentId/financial", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await getStudentByPublicId(studentId.trim());

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const [fees] = await pool.query(
      `SELECT term, amount_due, amount_paid
       FROM student_fees
       WHERE student_id = ?
       ORDER BY term`,
      [student.id]
    );

    const feeRecords = fees.map((fee) => ({
      term: fee.term,
      amountDue: Number(fee.amount_due),
      amountPaid: Number(fee.amount_paid),
      outstanding: Number((fee.amount_due - fee.amount_paid).toFixed(2)),
    }));

    const totalOutstanding = Number(
      feeRecords
        .reduce((sum, fee) => sum + fee.outstanding, 0)
        .toFixed(2)
    );

    const [payments] = await pool.query(
      `SELECT term, amount, paid_at
       FROM payments
       WHERE student_id = ?
       ORDER BY paid_at DESC`,
      [student.id]
    );

    res.json({
      student: {
        studentId: student.student_id,
        fullName: student.full_name,
        dateOfBirth: student.date_of_birth,
        address: student.address,
        form: student.form_enrolled,
      },
      fees: feeRecords,
      payments: payments.map((payment) => ({
        term: payment.term,
        amount: Number(payment.amount),
        paidAt: payment.paid_at,
      })),
      totalOutstanding,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/rooms", async (req, res, next) => {
  try {
    const { name, capacity } = req.body;
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: "Room name is required." });
    }

    const normalizedCapacity = Number(capacity);
    if (!Number.isInteger(normalizedCapacity) || normalizedCapacity <= 0) {
      return res
        .status(400)
        .json({ error: "Capacity must be a positive integer." });
    }

    const [result] = await pool.query(
      "INSERT INTO rooms (room_name, capacity) VALUES (?, ?)",
      [name.trim(), normalizedCapacity]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      capacity: normalizedCapacity,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/rooms", async (_req, res, next) => {
  try {
    const [rooms] = await pool.query(
      `SELECT id, room_name, capacity
       FROM rooms
       ORDER BY room_name`
    );

    res.json({
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.room_name,
        capacity: room.capacity,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { studentId, roomId, term } = req.body;

    if (!isNonEmptyString(studentId) || !isNonEmptyString(term)) {
      return res
        .status(400)
        .json({ error: "Student ID and term are required." });
    }

    const normalizedRoomId = Number(roomId);
    if (!Number.isInteger(normalizedRoomId) || normalizedRoomId <= 0) {
      return res.status(400).json({ error: "Room ID must be valid." });
    }

    await connection.beginTransaction();

    const student = await getStudentByPublicId(studentId.trim(), connection);
    if (!student) {
      await connection.rollback();
      return res.status(404).json({ error: "Student not found." });
    }

    const [feeRows] = await connection.query(
      `SELECT amount_due, amount_paid
       FROM student_fees
       WHERE student_id = ? AND term = ?
       FOR UPDATE`,
      [student.id, term.trim()]
    );

    if (feeRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "No fee schedule found for this term. Ask admin to set fees.",
      });
    }

    const fee = feeRows[0];
    if (Number(fee.amount_paid) < Number(fee.amount_due)) {
      await connection.rollback();
      return res.status(403).json({
        error: "Fees must be fully paid before booking a hostel room.",
      });
    }

    const [roomRows] = await connection.query(
      `SELECT id, room_name, capacity
       FROM rooms
       WHERE id = ?
       FOR UPDATE`,
      [normalizedRoomId]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Room not found." });
    }

    const [existingRows] = await connection.query(
      `SELECT id
       FROM hostel_bookings
       WHERE student_id = ? AND term = ?
       FOR UPDATE`,
      [student.id, term.trim()]
    );

    if (existingRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: "Student already has a booking for this term.",
      });
    }

    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS bookingCount
       FROM hostel_bookings
       WHERE room_id = ? AND term = ?
       FOR UPDATE`,
      [normalizedRoomId, term.trim()]
    );

    if (Number(countRows[0].bookingCount) >= Number(roomRows[0].capacity)) {
      await connection.rollback();
      return res.status(409).json({ error: "Room capacity is full." });
    }

    const [result] = await connection.query(
      `INSERT INTO hostel_bookings (student_id, room_id, term)
       VALUES (?, ?, ?)`,
      [student.id, normalizedRoomId, term.trim()]
    );

    await connection.commit();

    res.status(201).json({
      bookingId: result.insertId,
      studentId: student.student_id,
      roomId: normalizedRoomId,
      term: term.trim(),
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

app.get("/api/bookings", async (req, res, next) => {
  try {
    const { term } = req.query;
    const params = [];

    let query = `SELECT hb.id, hb.term, hb.booked_at,
        r.id AS roomId, r.room_name, r.capacity,
        s.student_id AS studentId, s.full_name AS fullName
      FROM hostel_bookings hb
      JOIN rooms r ON hb.room_id = r.id
      JOIN students s ON hb.student_id = s.id`;

    if (isNonEmptyString(term)) {
      query += " WHERE hb.term = ?";
      params.push(term.trim());
    }

    query += " ORDER BY hb.booked_at DESC";

    const [bookings] = await pool.query(query, params);

    res.json({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        term: booking.term,
        bookedAt: booking.booked_at,
        room: {
          id: booking.roomId,
          name: booking.room_name,
          capacity: booking.capacity,
        },
        student: {
          studentId: booking.studentId,
          fullName: booking.fullName,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`Student management API running on port ${port}`);
});
