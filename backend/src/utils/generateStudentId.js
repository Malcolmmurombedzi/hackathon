/**
 * Generates a unique 8-character student ID
 * Contains a mix of uppercase letters and digits
 */
const generateStudentId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = generateStudentId;
