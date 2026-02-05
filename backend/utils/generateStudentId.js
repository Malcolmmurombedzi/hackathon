const { customAlphabet } = require('nanoid');

// Create a custom nanoid generator with letters and digits
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

function generateStudentId() {
  return nanoid();
}

module.exports = generateStudentId;
