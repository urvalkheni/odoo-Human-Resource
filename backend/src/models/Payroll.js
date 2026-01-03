const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Payroll = sequelize.define('Payroll', {
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basic_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.JSONB,
    defaultValue: {
      house_rent: 0,
      transport: 0,
      medical: 0,
      other: 0
    }
  },
  deductions: {
    type: DataTypes.JSONB,
    defaultValue: {
      tax: 0,
      provident_fund: 0,
      insurance: 0,
      other: 0
    }
  },
  overtime_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  bonus: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  gross_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  net_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'processed', 'paid'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'cheque'),
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payroll',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'month', 'year']
    }
  ]
});

module.exports = Payroll;
