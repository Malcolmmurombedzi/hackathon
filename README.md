# Student Management System

Full-stack student management system built with:

- **Backend:** Node.js + Express
- **Database:** MySQL
- **Frontend:** React (Vite)

## Features

### Admin
- Enroll new students (auto-generates an 8-character alphanumeric student ID).
- Set term fee schedules and view financial records.
- Create hostel rooms with capacities and review room bookings.

### Students
- Login with their unique student ID.
- Pay fees online per term.
- Book hostel rooms after their term fees are fully paid.

## Project Structure

```
backend/   # Express API + MySQL schema
frontend/  # React UI
```

## Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MySQL credentials.

3. Initialize the database schema:
   ```bash
   npm run db:setup
   ```

4. Start the API:
   ```bash
   npm run dev
   ```

The API runs on `http://localhost:3001` by default.

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure the API base URL:
   ```bash
   cp .env.example .env
   ```

3. Start the UI:
   ```bash
   npm run dev
   ```

The UI runs on `http://localhost:5173` by default.

## API Notes

- Admin should set term fees for a student before fee payments or hostel bookings.
- Hostel booking requires the student to have fully paid their term fees.

## Useful Endpoints

- `POST /api/students` — enroll a student
- `POST /api/students/:studentId/fees` — set fee schedule
- `GET /api/students/:studentId/financial` — view financial records
- `POST /api/auth/login` — student login
- `POST /api/students/:studentId/payments` — fee payment
- `POST /api/rooms` — create hostel rooms
- `GET /api/bookings` — view bookings
- `POST /api/bookings` — student booking
