import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.form.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="view-students">
      <h2>All Students</h2>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, ID, or form..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="no-data">No students found</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Date of Birth</th>
                <th>Form</th>
                <th>Address</th>
                <th>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.student_id}>
                  <td><strong>{student.student_id}</strong></td>
                  <td>{student.full_name}</td>
                  <td>{formatDate(student.date_of_birth)}</td>
                  <td>{student.form}</td>
                  <td>{student.home_address}</td>
                  <td>{formatDate(student.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="stats">
        <p>Total Students: {students.length}</p>
      </div>
    </div>
  );
};

export default ViewStudents;
