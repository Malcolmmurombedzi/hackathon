const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'student_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // Create connection without database to create database if not exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password'
    });

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'student_management'}`);
    await connection.end();

    // Create tables
    const createTablesQueries = [
      // Students table
      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(8) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        home_address TEXT NOT NULL,
        form VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Fee payments table
      `CREATE TABLE IF NOT EXISTS fee_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(8) NOT NULL,
        term VARCHAR(50) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        amount_paid DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
      )`,
      
      // Fee structure table (defines fees per term)
      `CREATE TABLE IF NOT EXISTS fee_structure (
        id INT AUTO_INCREMENT PRIMARY KEY,
        term VARCHAR(50) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        total_fee DECIMAL(10, 2) NOT NULL,
        UNIQUE KEY unique_term_year (term, academic_year)
      )`,
      
      // Hostel rooms table
      `CREATE TABLE IF NOT EXISTS hostel_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(20) UNIQUE NOT NULL,
        capacity INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Room bookings table
      `CREATE TABLE IF NOT EXISTS room_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        student_id VARCHAR(8) NOT NULL,
        term VARCHAR(50) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_term (student_id, term, academic_year)
      )`
    ];

    for (const query of createTablesQueries) {
      await pool.execute(query);
    }

    // Insert default fee structure if not exists
    const defaultFees = [
      ['Term 1', '2025-2026', 5000.00],
      ['Term 2', '2025-2026', 5000.00],
      ['Term 3', '2025-2026', 5000.00],
      ['Term 1', '2026-2027', 5500.00],
      ['Term 2', '2026-2027', 5500.00],
      ['Term 3', '2026-2027', 5500.00]
    ];

    for (const [term, year, fee] of defaultFees) {
      await pool.execute(
        'INSERT IGNORE INTO fee_structure (term, academic_year, total_fee) VALUES (?, ?, ?)',
        [term, year, fee]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { pool, initializeDatabase };
