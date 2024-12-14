// src/utils/helpers.js
const generateSchoolCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const sanitizeUser = (user) => {
    const { password, __v, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  };
  
  module.exports = {
    generateSchoolCode,
    validateEmail,
    sanitizeUser,
  };