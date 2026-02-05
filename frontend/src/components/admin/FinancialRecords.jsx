import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const FinancialRecords = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminApi.getAllStudents();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancials = async (studentId) => {
    setLoadingFinancials(true);
    setError('');
    try {
      const response = await adminApi.getStudentFinancials(studentId);
      setFinancialData(response.data);
      setSelectedStudent(studentId);
    } catch (err) {
      setError('Failed to fetch financial records');
    } finally {
      setLoadingFinancials(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="financial-records">
      <h2>Financial Records</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="student-selector">
        <label htmlFor="student-select">Select Student:</label>
        <select
          id="student-select"
          onChange={(e) => e.target.value && fetchFinancials(e.target.value)}
          value={selectedStudent || ''}
        >
          <option value="">-- Select a student --</option>
          {students.map(student => (
            <option key={student.student_id} value={student.student_id}>
              {student.full_name} ({student.student_id})
            </option>
          ))}
        </select>
      </div>

      {loadingFinancials && <div className="loading">Loading financial records...</div>}

      {financialData && !loadingFinancials && (
        <div className="financial-details">
          <div className="student-info-card">
            <h3>{financialData.student.full_name}</h3>
            <p>Student ID: <strong>{financialData.student.student_id}</strong></p>
            <p>Form: {financialData.student.form}</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Academic Year</th>
                  <th>Total Fee</th>
                  <th>Amount Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {financialData.financial_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.term}</td>
                    <td>{record.academic_year}</td>
                    <td>{formatCurrency(record.total_fee)}</td>
                    <td>{formatCurrency(record.total_paid)}</td>
                    <td className={record.outstanding > 0 ? 'text-danger' : ''}>
                      {formatCurrency(record.outstanding)}
                    </td>
                    <td>
                      <span className={`status-badge ${record.is_paid ? 'paid' : 'pending'}`}>
                        {record.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <h4>Summary</h4>
            <p>
              Total Fees: {formatCurrency(
                financialData.financial_records.reduce((sum, r) => sum + r.total_fee, 0)
              )}
            </p>
            <p>
              Total Paid: {formatCurrency(
                financialData.financial_records.reduce((sum, r) => sum + r.total_paid, 0)
              )}
            </p>
            <p className="outstanding">
              Total Outstanding: {formatCurrency(
                financialData.financial_records.reduce((sum, r) => sum + r.outstanding, 0)
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialRecords;
