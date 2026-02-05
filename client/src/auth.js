const ADMIN_TOKEN_KEY = "sms_admin_token";
const STUDENT_TOKEN_KEY = "sms_student_token";
const STUDENT_NAME_KEY = "sms_student_name";
const STUDENT_ID_KEY = "sms_student_id";

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.location.href = "/admin";
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.location.href = "/";
}

export function setStudentSession({ token, student }) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token);
  localStorage.setItem(STUDENT_NAME_KEY, student?.fullName || "");
  localStorage.setItem(STUDENT_ID_KEY, student?.studentId || "");
  window.location.href = "/student";
}

export function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

export function getStudentName() {
  return localStorage.getItem(STUDENT_NAME_KEY) || "";
}

export function getStudentId() {
  return localStorage.getItem(STUDENT_ID_KEY) || "";
}

export function logoutStudent() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
  localStorage.removeItem(STUDENT_NAME_KEY);
  localStorage.removeItem(STUDENT_ID_KEY);
  window.location.href = "/";
}

