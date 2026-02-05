# Student Management System

A comprehensive web-based student management system built with Node.js, MySQL, and React.js. The system provides separate portals for administrators and students to manage enrollment, fee payments, and hostel bookings.

## Features

### Admin Features
1. **Student Enrollment**
   - Enroll new students with full details
   - Auto-generates unique 8-character student IDs
   - Captures: name, DOB, address, and form

2. **Financial Records Management**
   - View student payment history
   - Track fees paid by term
   - Monitor outstanding fees

3. **Hostel Management**
   - Create and manage hostel rooms
   - Set room capacity
   - View all room bookings

### Student Features
1. **Secure Login**
   - Login using unique student ID

2. **Fee Payment**
   - Pay fees online for specific terms
   - View payment history
   - Track total payments

3. **Hostel Booking**
   - Book hostel rooms for specific terms
   - Only available after fee payment for that term
   - View available rooms with capacity
   - Track personal bookings

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Frontend**: React.js with React Router
- **API Communication**: Axios
- **Authentication**: Header-based admin authentication

## Project Structure

```
/workspace/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration and initialization
│   ├── controllers/
│   │   ├── adminController.js  # Admin business logic
│   │   └── studentController.js # Student business logic
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin API routes
│   │   └── studentRoutes.js   # Student API routes
│   ├── utils/
│   │   └── generateStudentId.js # ID generation utility
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Admin/
    │   │   │   ├── AdminLogin.js
    │   │   │   └── AdminDashboard.js
    │   │   ├── Student/
    │   │   │   ├── StudentLogin.js
    │   │   │   └── StudentDashboard.js
    │   │   └── Home.js
    │   ├── config.js          # API configuration
    │   ├── App.js             # Main app component
    │   └── App.css            # Styling
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=student_management
   PORT=5000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. Ensure MySQL is running

5. Start the server:
```bash
npm start
```

The backend will:
- Create the database if it doesn't exist
- Create all necessary tables automatically
- Start listening on port 5000 (or configured port)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure API URL:
   - Create `.env` file
   - Add: `REACT_APP_API_URL=http://localhost:5000/api`

4. Start the development server:
```bash
npm start
```

The frontend will open at http://localhost:3000

## Usage

### Admin Portal

1. Navigate to http://localhost:3000
2. Click "Enter Admin Portal"
3. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
4. Access features:
   - Enroll new students
   - View all students
   - Check financial records
   - Create rooms
   - View bookings

### Student Portal

1. Navigate to http://localhost:3000
2. Click "Enter Student Portal"
3. Login with your student ID (8-character code)
4. Access features:
   - View personal information
   - Pay fees
   - View payment history
   - Book hostel rooms
   - View bookings

## Database Schema

### Tables

1. **students**
   - id (PRIMARY KEY)
   - student_id (UNIQUE, 8 characters)
   - full_name
   - date_of_birth
   - home_address
   - form
   - created_at

2. **fee_payments**
   - id (PRIMARY KEY)
   - student_id (FOREIGN KEY)
   - amount
   - term
   - payment_date

3. **rooms**
   - id (PRIMARY KEY)
   - room_number (UNIQUE)
   - capacity
   - created_at

4. **room_bookings**
   - id (PRIMARY KEY)
   - student_id (FOREIGN KEY)
   - room_id (FOREIGN KEY)
   - term
   - booking_date
   - UNIQUE constraint on (student_id, term)

## API Endpoints

### Admin Endpoints
- `POST /api/admin/students/enroll` - Enroll student
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/:student_id/financial-records` - Get financial records
- `POST /api/admin/rooms` - Create room
- `GET /api/admin/rooms` - Get all rooms
- `GET /api/admin/bookings` - Get all bookings

### Student Endpoints
- `POST /api/student/login` - Student login
- `POST /api/student/pay-fees` - Pay fees
- `POST /api/student/book-room` - Book room
- `GET /api/student/:student_id/financial-records` - Get own records
- `GET /api/student/:student_id/bookings` - Get own bookings
- `GET /api/student/rooms/available?term=TERM` - Get available rooms

## Security Features

- Admin authentication required for sensitive operations
- Student ID validation for student operations
- Fee payment validation before room booking
- Room capacity checks
- Unique constraints to prevent duplicate bookings

## UI/UX Features

- Modern gradient design
- Responsive layout
- Intuitive navigation
- Real-time feedback
- Success/error notifications
- Loading states
- Interactive room selection
- Data tables with hover effects

## Development

### Backend Development
```bash
cd backend
npm run dev  # If nodemon is installed
```

### Frontend Development
```bash
cd frontend
npm start
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
```

## License

This project is licensed under the ISC License.

## Support

For issues or questions, please contact the development team.
