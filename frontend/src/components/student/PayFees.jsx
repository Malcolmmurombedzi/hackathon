import { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';

const PayFees = ({ studentId }) => {
  const [feeStructure, setFeeStructure] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [paymentForm, setPaymentForm] = useState({
    term: '',
    academic_year: '',
    amount: ''
  });

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [feeRes, financialsRes] = await Promise.all([
        studentApi.getFeeStructure(),
        studentApi.getFinancials(studentId)
      ]);
      setFeeStructure(feeRes.data);
      setFinancialData(financialsRes.data);
    } catch (err) {
      setError('Failed to fetch fee information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate amount when term and year are selected
    if (name === 'term' || name === 'academic_year') {
      const newTerm = name === 'term' ? value : paymentForm.term;
      const newYear = name === 'academic_year' ? value : paymentForm.academic_year;
      
      if (newTerm && newYear && financialData) {
        const record = financialData.financial_records.find(
          r => r.term === newTerm && r.academic_year === newYear
        );
        if (record && record.outstanding > 0) {
          setPaymentForm(prev => ({
            ...prev,
            [name]: value,
            amount: record.outstanding.toString()
          }));
          return;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      await studentApi.payFees({
        student_id: studentId,
        term: paymentForm.term,
        academic_year: paymentForm.academic_year,
        amount: parseFloat(paymentForm.amount)
      });
      
      setMessage({ type: 'success', text: 'Payment successful!' });
      setPaymentForm({ term: '', academic_year: '', amount: '' });
      fetchData(); // Refresh data
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Payment failed. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getOutstandingAmount = () => {
    if (!financialData || !paymentForm.term || !paymentForm.academic_year) return null;
    
    const record = financialData.financial_records.find(
      r => r.term === paymentForm.term && r.academic_year === paymentForm.academic_year
    );
    
    return record?.outstanding || 0;
  };

  if (loading) return <div className="loading">Loading fee information...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const outstanding = getOutstandingAmount();

  return (
    <div className="pay-fees">
      <h2>Pay Fees</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="fee-summary">
        <h3>Fee Summary</h3>
        {financialData?.financial_records && (
          <div className="summary-cards">
            {financialData.financial_records
              .filter(r => r.outstanding > 0)
              .map((record, index) => (
                <div key={index} className="summary-card">
                  <h4>{record.term} - {record.academic_year}</h4>
                  <p>Total Fee: {formatCurrency(record.total_fee)}</p>
                  <p>Paid: {formatCurrency(record.total_paid)}</p>
                  <p className="outstanding">Outstanding: {formatCurrency(record.outstanding)}</p>
                </div>
              ))}
          </div>
        )}
        {financialData?.financial_records?.every(r => r.outstanding === 0) && (
          <p className="all-paid">All fees are paid!</p>
        )}
      </div>

      <div className="payment-form-section">
        <h3>Make a Payment</h3>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="term">Term</label>
              <select
                id="term"
                name="term"
                value={paymentForm.term}
                onChange={handleChange}
                required
              >
                <option value="">Select Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="academic_year">Academic Year</label>
              <select
                id="academic_year"
                name="academic_year"
                value={paymentForm.academic_year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>
          </div>

          {outstanding !== null && (
            <div className="outstanding-info">
              {outstanding > 0 ? (
                <p>Outstanding for selected term: <strong>{formatCurrency(outstanding)}</strong></p>
              ) : (
                <p className="paid-message">Fees for this term are already paid!</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="amount">Amount to Pay (USD)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="1"
              step="0.01"
              value={paymentForm.amount}
              onChange={handleChange}
              required
              placeholder="Enter amount"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || (outstanding !== null && outstanding === 0)}
          >
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayFees;
