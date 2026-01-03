const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_in: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_out: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half_day', 'leave'),
    defaultValue: 'absent'
  },
  working_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'date']
    }
  ]
});

module.exports = Attendance;
