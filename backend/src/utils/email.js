const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send email
 */
const sendEmail = async (options) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  await transporter.sendMail(message);
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, verificationUrl) => {
  const message = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Email Verification - Dayflow HRMS',
    html: message
  });
};

/**
 * Send password reset email
 */
const sendResetPasswordEmail = async (email, resetUrl) => {
  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset - Dayflow HRMS',
    html: message
  });
};

/**
 * Send leave approval notification
 */
const sendLeaveApprovalEmail = async (email, employeeName, status, remarks) => {
  const message = `
    <h1>Leave Request ${status}</h1>
    <p>Hello ${employeeName},</p>
    <p>Your leave request has been <strong>${status}</strong>.</p>
    ${remarks ? `< p > <strong>Remarks:</strong> ${remarks}</p> ` : ''}
    <p>Login to your dashboard for more details.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Leave Request ${status} - Dayflow HRMS`,
    html: message
  });
};

/**
 * Send payroll notification
 */
const sendPayrollEmail = async (email, employeeName, month, year, netSalary) => {
  const message = `
    <h1>Salary Credited</h1>
    <p>Hello ${employeeName},</p>
    <p>Your salary for <strong>${month}/${year}</strong> has been processed.</p>
    <p><strong>Net Salary:</strong> ₹${netSalary}</p>
    <p>Login to your dashboard to view detailed salary slip.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Salary Slip - ${month}/${year} - Dayflow HRMS`,
    html: message
  });
};

/**
 * Send credentials email (Welcome Email)
 */
const sendCredentialsEmail = async (email, employeeId, password) => {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #4f46e5;">Welcome to Dayflow HRMS</h1>
      <p>Hello,</p>
      <p>Your employee account has been successfully created. Here are your login credentials:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Employee ID:</strong> <span style="font-family: monospace; font-size: 1.1em;">${employeeId}</span></p>
        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 1.1em;">${password}</span></p>
      </div>

      <p>Please login immediately and change your password.</p>
      
      <a href="${loginUrl}/login" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">If the button doesn't work, copy shorter link: ${loginUrl}/login</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Dayflow - Your Login Credentials',
    html: message
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendLeaveApprovalEmail,
  sendPayrollEmail,
  sendCredentialsEmail
};
