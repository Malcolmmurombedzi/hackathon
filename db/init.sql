-- Student Management System schema (MySQL 8)

CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id CHAR(8) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE NOT NULL,
  home_address VARCHAR(500) NOT NULL,
  form VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_id (student_id)
);

CREATE TABLE IF NOT EXISTS terms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(100) NOT NULL,
  fee_required DECIMAL(10,2) NOT NULL DEFAULT 0,
  starts_on DATE NULL,
  ends_on DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_terms_code (code)
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_pk BIGINT UNSIGNED NOT NULL,
  term_code VARCHAR(32) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference VARCHAR(64) NOT NULL,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fee_payments_student_term (student_pk, term_code),
  CONSTRAINT fk_fee_payments_student FOREIGN KEY (student_pk) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_code VARCHAR(32) NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_room_code (room_code)
);

CREATE TABLE IF NOT EXISTS room_bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_pk BIGINT UNSIGNED NOT NULL,
  student_pk BIGINT UNSIGNED NOT NULL,
  term_code VARCHAR(32) NOT NULL,
  booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_student_term (student_pk, term_code),
  KEY idx_room_bookings_room_term (room_pk, term_code),
  CONSTRAINT fk_room_bookings_room FOREIGN KEY (room_pk) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_room_bookings_student FOREIGN KEY (student_pk) REFERENCES students(id) ON DELETE CASCADE
);

INSERT INTO terms (code, name, fee_required, starts_on, ends_on)
VALUES
  ('2026-T1', 'Term 1 2026', 500.00, '2026-01-01', '2026-04-30'),
  ('2026-T2', 'Term 2 2026', 500.00, '2026-05-01', '2026-08-31'),
  ('2026-T3', 'Term 3 2026', 500.00, '2026-09-01', '2026-12-31')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  fee_required = VALUES(fee_required),
  starts_on = VALUES(starts_on),
  ends_on = VALUES(ends_on);

