# Student Management System - Frontend

A React.js frontend for the Student Management System with separate portals for administrators and students.

## Features

### Admin Portal
- Enroll new students
- View all students
- View student financial records
- Create hostel rooms
- View all rooms
- View all room bookings

### Student Portal
- Login with student ID
- View personal information
- Pay fees online
- View payment history
- Book hostel rooms (with fee payment validation)
- View personal bookings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the API URL (optional):
   - Create a `.env` file in the frontend directory
   - Add: `REACT_APP_API_URL=http://localhost:5000/api`
   - Default is `http://localhost:5000/api`

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## Admin Credentials

Default admin credentials:
- Username: `admin`
- Password: `admin123`

(These can be configured in the backend `.env` file)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── Admin/
│   │   ├── AdminLogin.js
│   │   └── AdminDashboard.js
│   ├── Student/
│   │   ├── StudentLogin.js
│   │   └── StudentDashboard.js
│   └── Home.js
├── config.js
├── App.js
├── App.css
└── index.js
```

## Features Overview

### Modern UI/UX
- Beautiful gradient design
- Responsive layout
- Card-based interface
- Smooth transitions and hover effects
- Clear navigation and feedback

### Admin Features
- Multi-tab dashboard for different operations
- Real-time data updates
- Form validation
- Success/error notifications

### Student Features
- Intuitive navigation
- Visual room selection
- Payment tracking
- Booking management
