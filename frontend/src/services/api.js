import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Admin APIs
export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  enrollStudent: (data) => api.post('/admin/students', data),
  getAllStudents: () => api.get('/admin/students'),
  getStudentById: (studentId) => api.get(`/admin/students/${studentId}`),
  getStudentFinancials: (studentId) => api.get(`/admin/students/${studentId}/financials`),
  getFeeStructure: () => api.get('/admin/fee-structure'),
  createRoom: (data) => api.post('/admin/rooms', data),
  getAllRooms: (term, academicYear) => {
    const params = term && academicYear ? `?term=${term}&academic_year=${academicYear}` : '';
    return api.get(`/admin/rooms${params}`);
  },
  getAllBookings: () => api.get('/admin/bookings')
};

// Student APIs
export const studentApi = {
  login: (student_id) => api.post('/student/login', { student_id }),
  getProfile: (studentId) => api.get(`/student/profile/${studentId}`),
  getFeeStructure: () => api.get('/student/fee-structure'),
  payFees: (data) => api.post('/student/pay-fees', data),
  getFinancials: (studentId) => api.get(`/student/financials/${studentId}`),
  checkFeePaid: (studentId, term, academicYear) => 
    api.get(`/student/check-fee/${studentId}/${term}/${academicYear}`),
  getRooms: (term, academicYear) => {
    const params = term && academicYear ? `?term=${term}&academic_year=${academicYear}` : '';
    return api.get(`/student/rooms${params}`);
  },
  bookRoom: (data) => api.post('/student/book-room', data),
  getBookings: (studentId) => api.get(`/student/bookings/${studentId}`)
};

export default api;
