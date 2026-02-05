# Student Management System

Monorepo with:
- **Backend**: Node.js + Express
- **Database**: MySQL 8 (via Docker)
- **Frontend**: React (Vite)

## Quick start

### 1) Start MySQL

```bash
cd /workspace
docker compose up -d
```

This will create DB `student_management` and apply `db/init.sql`.

### 2) Configure backend env

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if needed.

### 3) Run backend + frontend

```bash
npm run dev
```

- Backend: `http://localhost:4000`
- Frontend: printed by Vite (usually `http://localhost:5173`)

## API overview (high level)

- **Admin**
  - `POST /api/admin/login`
  - `POST /api/admin/students` (enroll)
  - `GET /api/admin/students/:studentId/financials`
  - `POST /api/admin/rooms`
  - `GET /api/admin/bookings`

- **Student**
  - `POST /api/student/login`
  - `GET /api/student/me/financials`
  - `POST /api/student/payments` (records an online fee payment)
  - `GET /api/student/rooms?termCode=2026-T1`
  - `POST /api/student/bookings` (requires term fees fully paid)

