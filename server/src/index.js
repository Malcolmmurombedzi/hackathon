import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { query } from "./db.js";
import { authRequired, requireRole, signToken } from "./auth.js";
import { money, randomStudentId } from "./utils.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function assertEnv() {
  const required = ["DATABASE_HOST", "DATABASE_USER", "DATABASE_PASSWORD", "DATABASE_NAME", "JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`Missing env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

app.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1 as ok");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB unavailable" });
  }
});

// Auth
app.post("/api/admin/login", (req, res) => {
  const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  const { username, password } = parsed.data;

  if (username !== (process.env.ADMIN_USERNAME || "admin") || password !== (process.env.ADMIN_PASSWORD || "admin123")) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken({ role: "admin", sub: "admin" });
  return res.json({ token });
});

app.post("/api/student/login", async (req, res) => {
  const schema = z.object({ studentId: z.string().length(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const rows = await query("SELECT id, student_id, full_name FROM students WHERE student_id = :studentId", {
    studentId: parsed.data.studentId,
  });
  if (!rows.length) return res.status(401).json({ error: "Invalid student ID" });
  const student = rows[0];
  const token = signToken({ role: "student", sub: String(student.id), studentId: student.student_id, name: student.full_name });
  return res.json({ token, student: { studentId: student.student_id, fullName: student.full_name } });
});

// Admin: enroll student
app.post("/api/admin/students", authRequired, requireRole("admin"), async (req, res) => {
  const schema = z.object({
    fullName: z.string().min(2),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    homeAddress: z.string().min(5),
    form: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  // generate unique 8-char student ID
  let studentId = randomStudentId();
  for (let i = 0; i < 10; i++) {
    const existing = await query("SELECT 1 FROM students WHERE student_id = :studentId", { studentId });
    if (!existing.length) break;
    studentId = randomStudentId();
  }

  const result = await query(
    "INSERT INTO students (student_id, full_name, date_of_birth, home_address, form) VALUES (:studentId, :fullName, :dob, :address, :form)",
    {
      studentId,
      fullName: parsed.data.fullName,
      dob: parsed.data.dateOfBirth,
      address: parsed.data.homeAddress,
      form: parsed.data.form,
    },
  );

  return res.status(201).json({ studentId, id: result.insertId });
});

// Admin: financial records for a student (by student_id)
app.get("/api/admin/students/:studentId/financials", authRequired, requireRole("admin"), async (req, res) => {
  const studentId = req.params.studentId;
  const students = await query("SELECT id, student_id, full_name FROM students WHERE student_id = :studentId", { studentId });
  if (!students.length) return res.status(404).json({ error: "Student not found" });
  const student = students[0];

  const terms = await query("SELECT code, name, fee_required FROM terms ORDER BY starts_on IS NULL, starts_on, code");
  const payments = await query(
    "SELECT term_code, SUM(amount) as total_paid FROM fee_payments WHERE student_pk = :studentPk GROUP BY term_code",
    { studentPk: student.id },
  );
  const paidByTerm = new Map(payments.map((p) => [p.term_code, Number(p.total_paid || 0)]));

  const records = terms.map((t) => {
    const paid = Number(paidByTerm.get(t.code) || 0);
    const required = Number(t.fee_required || 0);
    const outstanding = money(Math.max(required - paid, 0));
    return { termCode: t.code, termName: t.name, requiredFee: required, paidFee: money(paid), outstandingFee: outstanding };
  });

  return res.json({ student: { studentId: student.student_id, fullName: student.full_name }, records });
});

// Admin: rooms
app.post("/api/admin/rooms", authRequired, requireRole("admin"), async (req, res) => {
  const schema = z.object({ roomCode: z.string().min(1), capacity: z.number().int().min(1).max(20) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  try {
    const result = await query("INSERT INTO rooms (room_code, capacity) VALUES (:roomCode, :capacity)", parsed.data);
    return res.status(201).json({ id: result.insertId, ...parsed.data });
  } catch (e) {
    return res.status(400).json({ error: "Room code already exists" });
  }
});

app.get("/api/admin/bookings", authRequired, requireRole("admin"), async (_req, res) => {
  const rows = await query(
    `SELECT rb.id, rb.term_code, rb.booked_at,
            r.room_code, r.capacity,
            s.student_id, s.full_name
     FROM room_bookings rb
     JOIN rooms r ON r.id = rb.room_pk
     JOIN students s ON s.id = rb.student_pk
     ORDER BY rb.booked_at DESC`,
  );
  return res.json({ bookings: rows });
});

// Student: list terms + financial summary
app.get("/api/student/me/financials", authRequired, requireRole("student"), async (req, res) => {
  const studentPk = Number(req.user.sub);
  const terms = await query("SELECT code, name, fee_required FROM terms ORDER BY starts_on IS NULL, starts_on, code");
  const payments = await query(
    "SELECT term_code, SUM(amount) as total_paid FROM fee_payments WHERE student_pk = :studentPk GROUP BY term_code",
    { studentPk },
  );
  const paidByTerm = new Map(payments.map((p) => [p.term_code, Number(p.total_paid || 0)]));
  const records = terms.map((t) => {
    const paid = Number(paidByTerm.get(t.code) || 0);
    const required = Number(t.fee_required || 0);
    const outstanding = money(Math.max(required - paid, 0));
    return { termCode: t.code, termName: t.name, requiredFee: required, paidFee: money(paid), outstandingFee: outstanding };
  });
  return res.json({ records });
});

// Student: "online payment" (record a payment)
app.post("/api/student/payments", authRequired, requireRole("student"), async (req, res) => {
  const schema = z.object({
    termCode: z.string().min(1),
    amount: z.number().positive().max(100000),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const studentPk = Number(req.user.sub);
  const terms = await query("SELECT fee_required FROM terms WHERE code = :code", { code: parsed.data.termCode });
  if (!terms.length) return res.status(404).json({ error: "Term not found" });

  const reference = `PAY-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  await query(
    "INSERT INTO fee_payments (student_pk, term_code, amount, reference) VALUES (:studentPk, :termCode, :amount, :reference)",
    { studentPk, termCode: parsed.data.termCode, amount: parsed.data.amount, reference },
  );
  return res.status(201).json({ reference });
});

// Student: room availability
app.get("/api/student/rooms", authRequired, requireRole("student"), async (req, res) => {
  const termCode = String(req.query.termCode || "").trim();
  if (!termCode) return res.status(400).json({ error: "termCode is required" });
  const terms = await query("SELECT 1 FROM terms WHERE code = :code", { code: termCode });
  if (!terms.length) return res.status(404).json({ error: "Term not found" });

  const rooms = await query(
    `SELECT r.id, r.room_code, r.capacity,
            COALESCE(b.booked, 0) as booked
     FROM rooms r
     LEFT JOIN (
       SELECT room_pk, COUNT(*) as booked
       FROM room_bookings
       WHERE term_code = :termCode
       GROUP BY room_pk
     ) b ON b.room_pk = r.id
     ORDER BY r.room_code`,
    { termCode },
  );
  const out = rooms.map((r) => ({ id: r.id, roomCode: r.room_code, capacity: r.capacity, booked: r.booked, available: r.capacity - r.booked }));
  return res.json({ rooms: out });
});

// Student: book a room for term (only if paid required fee for term)
app.post("/api/student/bookings", authRequired, requireRole("student"), async (req, res) => {
  const schema = z.object({ roomId: z.number().int().positive(), termCode: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const studentPk = Number(req.user.sub);
  const termRows = await query("SELECT fee_required FROM terms WHERE code = :code", { code: parsed.data.termCode });
  if (!termRows.length) return res.status(404).json({ error: "Term not found" });
  const required = Number(termRows[0].fee_required || 0);

  const paidRows = await query(
    "SELECT COALESCE(SUM(amount),0) as paid FROM fee_payments WHERE student_pk = :studentPk AND term_code = :termCode",
    { studentPk, termCode: parsed.data.termCode },
  );
  const paid = Number(paidRows[0]?.paid || 0);
  if (paid < required) return res.status(400).json({ error: "Fees not fully paid for this term" });

  const rooms = await query("SELECT id, capacity FROM rooms WHERE id = :roomId", { roomId: parsed.data.roomId });
  if (!rooms.length) return res.status(404).json({ error: "Room not found" });
  const room = rooms[0];

  const booked = await query("SELECT COUNT(*) as cnt FROM room_bookings WHERE room_pk = :roomId AND term_code = :termCode", {
    roomId: parsed.data.roomId,
    termCode: parsed.data.termCode,
  });
  if (Number(booked[0].cnt) >= Number(room.capacity)) return res.status(400).json({ error: "Room is full" });

  try {
    await query(
      "INSERT INTO room_bookings (room_pk, student_pk, term_code) VALUES (:roomId, :studentPk, :termCode)",
      { roomId: parsed.data.roomId, studentPk, termCode: parsed.data.termCode },
    );
  } catch (e) {
    return res.status(400).json({ error: "Already booked for this term" });
  }

  return res.status(201).json({ ok: true });
});

const port = Number(process.env.PORT || 4000);
assertEnv();
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

