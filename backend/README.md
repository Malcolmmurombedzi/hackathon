# Student Management System - Backend

A Node.js backend API for managing student enrollment, fee payments, and hostel bookings.

## Features

### Admin Features
- Enroll new students with auto-generated 8-character student IDs
- View all students
- View student financial records
- Create and manage hostel rooms
- View all room bookings

### Student Features
- Login with student ID
- Pay fees for terms
- Book hostel rooms (only if fees are paid for that term)
- View personal financial records
- View personal bookings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

3. Make sure MySQL is installed and running

4. Start the server:
```bash
npm start
```

The server will automatically create the database and tables on first run.

## API Endpoints

### Admin Endpoints (require authentication headers)
- `POST /api/admin/students/enroll` - Enroll a new student
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/:student_id/financial-records` - Get student financial records
- `POST /api/admin/rooms` - Create a new room
- `GET /api/admin/rooms` - Get all rooms
- `GET /api/admin/bookings` - Get all room bookings

### Student Endpoints
- `POST /api/student/login` - Student login
- `POST /api/student/pay-fees` - Pay fees
- `POST /api/student/book-room` - Book a hostel room
- `GET /api/student/:student_id/financial-records` - Get own financial records
- `GET /api/student/:student_id/bookings` - Get own bookings
- `GET /api/student/rooms/available?term=TERM` - Get available rooms for a term

## Admin Authentication

Admin endpoints require the following headers:
- `username`: admin
- `password`: admin123

(These can be configured in the `.env` file)
