# Student Management System

A comprehensive student management system with features for student enrollment, fee management, and hostel booking.

## Features

### Admin Features
1. **Student Enrollment**: Enroll new students with auto-generated 8-character unique student IDs
2. **Financial Records**: View student fees paid per term and outstanding fees
3. **Hostel Management**: Create rooms with capacity and view all room bookings

### Student Features
1. **Login**: Students login using their unique student ID
2. **Fee Payment**: Pay fees online for any term
3. **Hostel Booking**: Book hostel rooms (only if fees are paid for that term)

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Frontend**: React.js with Vite

## Project Structure

```
student-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── feeController.js
│   │   │   ├── hostelController.js
│   │   │   └── studentController.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   └── studentRoutes.js
│   │   ├── utils/
│   │   │   └── generateStudentId.js
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── EnrollStudent.jsx
│   │   │   │   ├── FinancialRecords.jsx
│   │   │   │   ├── HostelManagement.jsx
│   │   │   │   └── ViewStudents.jsx
│   │   │   └── student/
│   │   │       ├── BookHostel.jsx
│   │   │       ├── MyRecords.jsx
│   │   │       └── PayFees.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── StudentLogin.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server

### Database Setup

1. Make sure MySQL is running
2. Update the database configuration in `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will:
- Automatically create the database if it doesn't exist
- Create all required tables
- Insert default fee structure data
- Start the server on port 5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port 5173 (or next available port).

## API Endpoints

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Admin login |
| POST | /api/admin/students | Enroll new student |
| GET | /api/admin/students | Get all students |
| GET | /api/admin/students/:studentId | Get student by ID |
| GET | /api/admin/students/:studentId/financials | Get student financial records |
| GET | /api/admin/fee-structure | Get fee structure |
| POST | /api/admin/rooms | Create new hostel room |
| GET | /api/admin/rooms | Get all rooms with availability |
| GET | /api/admin/bookings | Get all room bookings |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/student/login | Student login |
| GET | /api/student/profile/:studentId | Get student profile |
| GET | /api/student/fee-structure | Get fee structure |
| POST | /api/student/pay-fees | Pay fees |
| GET | /api/student/financials/:studentId | Get financial records |
| GET | /api/student/check-fee/:studentId/:term/:academicYear | Check fee payment status |
| GET | /api/student/rooms | Get available rooms |
| POST | /api/student/book-room | Book a room |
| GET | /api/student/bookings/:studentId | Get student's bookings |

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Student
- Use the 8-character Student ID generated during enrollment

## Usage

1. **Admin Login**: Navigate to the Admin Portal and login with admin credentials
2. **Enroll Students**: Use the enrollment form to add new students
3. **Create Hostel Rooms**: Add rooms with capacity for student bookings
4. **Student Login**: Students use their unique 8-character ID to login
5. **Pay Fees**: Students can pay fees for any term
6. **Book Hostel**: Students can book rooms after paying fees for that term

## Database Schema

### Tables

1. **students**: Student information
2. **fee_payments**: Fee payment records
3. **fee_structure**: Fee amounts per term/year
4. **hostel_rooms**: Room information
5. **room_bookings**: Room booking records

## License

MIT License
