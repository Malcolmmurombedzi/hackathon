const { pool } = require('../config/database');

// Get fee structure
const getFeeStructure = async (req, res) => {
  try {
    const [fees] = await pool.execute('SELECT * FROM fee_structure ORDER BY academic_year, term');
    res.json(fees);
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ error: 'Failed to fetch fee structure' });
  }
};

// Pay fees
const payFees = async (req, res) => {
  try {
    const { student_id, term, academic_year, amount } = req.body;

    // Validate required fields
    if (!student_id || !term || !academic_year || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify student exists
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get fee structure for the term
    const [feeStructure] = await pool.execute(
      'SELECT * FROM fee_structure WHERE term = ? AND academic_year = ?',
      [term, academic_year]
    );

    if (feeStructure.length === 0) {
      return res.status(404).json({ error: 'Fee structure not found for the specified term' });
    }

    // Record payment
    await pool.execute(
      'INSERT INTO fee_payments (student_id, term, academic_year, amount_paid) VALUES (?, ?, ?, ?)',
      [student_id, term, academic_year, amount]
    );

    res.status(201).json({
      message: 'Fee payment recorded successfully',
      payment: {
        student_id,
        term,
        academic_year,
        amount_paid: amount
      }
    });
  } catch (error) {
    console.error('Error processing fee payment:', error);
    res.status(500).json({ error: 'Failed to process fee payment' });
  }
};

// Get student financial records
const getStudentFinancials = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all fee payments for this student
    const [payments] = await pool.execute(
      'SELECT * FROM fee_payments WHERE student_id = ? ORDER BY academic_year, term, payment_date',
      [studentId]
    );

    // Get fee structure
    const [feeStructure] = await pool.execute('SELECT * FROM fee_structure');

    // Calculate totals and outstanding amounts
    const financialSummary = [];

    for (const fee of feeStructure) {
      const termPayments = payments.filter(
        p => p.term === fee.term && p.academic_year === fee.academic_year
      );
      
      const totalPaid = termPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const outstanding = parseFloat(fee.total_fee) - totalPaid;

      financialSummary.push({
        term: fee.term,
        academic_year: fee.academic_year,
        total_fee: parseFloat(fee.total_fee),
        total_paid: totalPaid,
        outstanding: outstanding > 0 ? outstanding : 0,
        is_paid: outstanding <= 0,
        payments: termPayments
      });
    }

    res.json({
      student: students[0],
      financial_records: financialSummary
    });
  } catch (error) {
    console.error('Error fetching financial records:', error);
    res.status(500).json({ error: 'Failed to fetch financial records' });
  }
};

// Check if student has paid fees for a term
const checkFeePaid = async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.params;

    // Get fee structure for the term
    const [feeStructure] = await pool.execute(
      'SELECT * FROM fee_structure WHERE term = ? AND academic_year = ?',
      [term, academicYear]
    );

    if (feeStructure.length === 0) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    // Get total payments for this term
    const [payments] = await pool.execute(
      'SELECT SUM(amount_paid) as total_paid FROM fee_payments WHERE student_id = ? AND term = ? AND academic_year = ?',
      [studentId, term, academicYear]
    );

    const totalPaid = payments[0].total_paid || 0;
    const totalFee = parseFloat(feeStructure[0].total_fee);
    const isPaid = totalPaid >= totalFee;

    res.json({
      student_id: studentId,
      term,
      academic_year: academicYear,
      total_fee: totalFee,
      total_paid: parseFloat(totalPaid),
      is_paid: isPaid
    });
  } catch (error) {
    console.error('Error checking fee status:', error);
    res.status(500).json({ error: 'Failed to check fee status' });
  }
};

module.exports = {
  getFeeStructure,
  payFees,
  getStudentFinancials,
  checkFeePaid
};
