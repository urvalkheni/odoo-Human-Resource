const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate email verification token
 */
const generateVerificationToken = () => {
  return jwt.sign(
    { purpose: 'email_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Generate password reset token
 */
const generateResetToken = () => {
  const resetToken = jwt.sign(
    { purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return resetToken;
};

module.exports = {
  generateToken,
  verifyToken,
  generateVerificationToken,
  generateResetToken
};
