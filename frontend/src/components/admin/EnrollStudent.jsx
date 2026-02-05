import { useState } from 'react';
import { adminApi } from '../../services/api';

const EnrollStudent = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    home_address: '',
    form: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [enrolledStudent, setEnrolledStudent] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminApi.enrollStudent(formData);
      setMessage({ type: 'success', text: 'Student enrolled successfully!' });
      setEnrolledStudent(response.data.student);
      setFormData({
        full_name: '',
        date_of_birth: '',
        home_address: '',
        form: ''
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to enroll student' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enroll-student">
      <h2>Enroll New Student</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {enrolledStudent && (
        <div className="enrolled-info">
          <h3>Student Enrolled Successfully!</h3>
          <div className="student-id-display">
            <p>Student ID:</p>
            <strong>{enrolledStudent.student_id}</strong>
          </div>
          <p className="note">Please save this ID. Students will use it to login.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="enroll-form">
        <div className="form-group">
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="Enter student's full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_of_birth">Date of Birth</label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="home_address">Home Address</label>
          <textarea
            id="home_address"
            name="home_address"
            value={formData.home_address}
            onChange={handleChange}
            required
            placeholder="Enter student's home address"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="form">Form/Class</label>
          <select
            id="form"
            name="form"
            value={formData.form}
            onChange={handleChange}
            required
          >
            <option value="">Select Form</option>
            <option value="Form 1">Form 1</option>
            <option value="Form 2">Form 2</option>
            <option value="Form 3">Form 3</option>
            <option value="Form 4">Form 4</option>
            <option value="Form 5">Form 5</option>
            <option value="Form 6">Form 6</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
    </div>
  );
};

export default EnrollStudent;
