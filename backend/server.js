const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/employees', require('./src/routes/employee.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/leaves', require('./src/routes/leave.routes'));
app.use('/api/payroll', require('./src/routes/payroll.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dayflow HRMS API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Dayflow HRMS API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      employees: '/api/employees',
      departments: '/api/departments',
      attendance: '/api/attendance',
      leaves: '/api/leaves',
      payroll: '/api/payroll'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 Dayflow HRMS Server Running`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 API: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
});

module.exports = app;
