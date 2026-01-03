const User = require('./User');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Payroll = require('./Payroll');
const Company = require('./Company');

// Define associations
User.hasOne(Employee, {
  foreignKey: 'user_id',
  as: 'employeeProfile',
  onDelete: 'CASCADE'
});

Employee.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Company.hasMany(Employee, {
  foreignKey: 'company_id',
  as: 'employees',
  onDelete: 'CASCADE'
});

Employee.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

Employee.hasMany(Attendance, {
  foreignKey: 'employee_id',
  as: 'attendanceRecords',
  onDelete: 'CASCADE'
});

Attendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

Employee.hasMany(Leave, {
  foreignKey: 'employee_id',
  as: 'leaveRecords',
  onDelete: 'CASCADE'
});

Leave.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

Leave.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver'
});

Employee.hasMany(Payroll, {
  foreignKey: 'employee_id',
  as: 'payrollRecords',
  onDelete: 'CASCADE'
});

Payroll.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

module.exports = {
  User,
  Employee,
  Attendance,
  Leave,
  Payroll,
  Company
};
