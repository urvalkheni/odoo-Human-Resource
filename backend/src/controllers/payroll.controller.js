const { Payroll, Employee, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const { sendPayrollEmail } = require('../utils/email');
const moment = require('moment');

// @desc    Create payroll entry
// @route   POST /api/v1/payroll
// @access  Private (HR/Admin)
exports.createPayroll = async (req, res, next) => {
  try {
    const {
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      deductions,
      overtime_amount,
      bonus,
      payment_method,
      payment_date,
      notes
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Check if payroll already exists for this month/year
    const existingPayroll = await Payroll.findOne({
      where: { employee_id, month, year }
    });

    if (existingPayroll) {
      return next(new ErrorResponse('Payroll already exists for this employee in this month/year', 400));
    }

    // Calculate gross and net salary
    const totalAllowances = allowances
      ? Object.values(allowances).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;

    const totalDeductions = deductions
      ? Object.values(deductions).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;

    const gross_salary = parseFloat(basic_salary) + totalAllowances + parseFloat(overtime_amount || 0) + parseFloat(bonus || 0);
    const net_salary = gross_salary - totalDeductions;

    // Create payroll
    const payroll = await Payroll.create({
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      deductions,
      overtime_amount: overtime_amount || 0,
      bonus: bonus || 0,
      gross_salary,
      net_salary,
      payment_status: 'pending',
      payment_method: payment_method || 'bank_transfer',
      payment_date: payment_date || null,
      remarks: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payroll records
// @route   GET /api/v1/payroll
// @access  Private (HR/Admin)
exports.getAllPayroll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee_id,
      month,
      year,
      payment_status,
      department
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filter conditions
    const where = {};

    if (employee_id) where.employee_id = employee_id;
    if (month) where.month = month;
    if (year) where.year = year;
    if (payment_status) where.payment_status = payment_status;

    // Include filters
    const includeOptions = {
      model: Employee,
      as: 'employee',
      attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department', 'designation']
    };

    if (department) {
      includeOptions.where = { department };
    }

    const { count, rows: payroll } = await Payroll.findAndCountAll({
      where,
      include: [includeOptions],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: payroll.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payroll by ID
// @route   GET /api/v1/payroll/:id
// @access  Private
exports.getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department', 'designation'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email']
            }
          ]
        }
      ]
    });

    if (!payroll) {
      return next(new ErrorResponse('Payroll record not found', 404));
    }

    // Employees can only view their own payroll
    if (req.user.role === 'employee' && payroll.employee_id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to view this payroll', 403));
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my payroll history
// @route   GET /api/v1/payroll/my-payroll
// @access  Private (Employee)
exports.getMyPayroll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      year
    } = req.query;

    const offset = (page - 1) * limit;
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Build filter conditions
    const where = { employee_id };
    if (year) where.year = year;

    const { count, rows: payroll } = await Payroll.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    // Calculate summary
    const totalEarned = await Payroll.sum('net_salary', {
      where: { employee_id, payment_status: 'paid' }
    });

    const totalPending = await Payroll.sum('net_salary', {
      where: { employee_id, payment_status: 'pending' }
    });

    res.status(200).json({
      success: true,
      count: payroll.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      summary: {
        totalEarned: totalEarned || 0,
        totalPending: totalPending || 0
      },
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payroll by employee
// @route   GET /api/v1/payroll/employee/:employeeId
// @access  Private (HR/Admin)
exports.getPayrollByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 10, year } = req.query;

    const offset = (page - 1) * limit;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Build filter conditions
    const where = { employee_id: employeeId };
    if (year) where.year = year;

    const { count, rows: payroll } = await Payroll.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: payroll.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payroll
// @route   PUT /api/v1/payroll/:id
// @access  Private (HR/Admin)
exports.updatePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return next(new ErrorResponse('Payroll record not found', 404));
    }

    const {
      basic_salary,
      allowances,
      deductions,
      overtime_amount,
      bonus,
      payment_status,
      payment_method,
      payment_date,
      notes
    } = req.body;

    // Recalculate if salary components changed
    let updates = { ...req.body };

    if (basic_salary || allowances || deductions || overtime_amount || bonus) {
      const totalAllowances = (allowances || payroll.allowances)
        ? Object.values(allowances || payroll.allowances).reduce((sum, val) => sum + parseFloat(val || 0), 0)
        : 0;

      const totalDeductions = (deductions || payroll.deductions)
        ? Object.values(deductions || payroll.deductions).reduce((sum, val) => sum + parseFloat(val || 0), 0)
        : 0;

      const newBasicSalary = parseFloat(basic_salary || payroll.basic_salary);
      const newOvertimeAmount = parseFloat(overtime_amount || payroll.overtime_amount || 0);
      const newBonus = parseFloat(bonus || payroll.bonus || 0);

      updates.gross_salary = newBasicSalary + totalAllowances + newOvertimeAmount + newBonus;
      updates.net_salary = updates.gross_salary - totalDeductions;
    }

    await payroll.update(updates);

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/v1/payroll/:id/payment-status
// @access  Private (HR/Admin)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_status, payment_date } = req.body;

    if (!['pending', 'processing', 'paid', 'failed'].includes(payment_status)) {
      return next(new ErrorResponse('Invalid payment status', 400));
    }

    const payroll = await Payroll.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email']
            }
          ]
        }
      ]
    });

    if (!payroll) {
      return next(new ErrorResponse('Payroll record not found', 404));
    }

    await payroll.update({
      payment_status,
      payment_date: payment_date || (payment_status === 'paid' ? new Date() : payroll.payment_date)
    });

    // Send email notification if payment is processed
    if (payment_status === 'paid') {
      try {
        await sendPayrollEmail(
          payroll.employee.user.email,
          {
            employeeName: `${payroll.employee.first_name} ${payroll.employee.last_name}`,
            month: payroll.month,
            year: payroll.year,
            basicSalary: payroll.basic_salary,
            grossSalary: payroll.gross_salary,
            netSalary: payroll.net_salary,
            allowances: payroll.allowances,
            deductions: payroll.deductions,
            paymentDate: payroll.payment_date
          }
        );
      } catch (emailError) {
        console.error('Failed to send payroll email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: payroll
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/v1/payroll/:id
// @access  Private (Admin only)
exports.deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return next(new ErrorResponse('Payroll record not found', 404));
    }

    // Don't allow deleting paid payroll
    if (payroll.payment_status === 'paid') {
      return next(new ErrorResponse('Cannot delete paid payroll records', 400));
    }

    await payroll.destroy();

    res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate payslip
// @route   GET /api/v1/payroll/:id/payslip
// @access  Private
exports.generatePayslip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department', 'designation', 'date_of_joining']
        }
      ]
    });

    if (!payroll) {
      return next(new ErrorResponse('Payroll record not found', 404));
    }

    // Employees can only view their own payslip
    if (req.user.role === 'employee' && payroll.employee_id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to view this payslip', 403));
    }

    // Format payslip data
    const payslip = {
      employee: {
        name: `${payroll.employee.first_name} ${payroll.employee.last_name}`,
        employee_code: payroll.employee.employee_code,
        department: payroll.employee.department,
        designation: payroll.employee.designation,
        date_of_joining: payroll.employee.date_of_joining
      },
      period: {
        month: payroll.month,
        year: payroll.year
      },
      earnings: {
        basic_salary: payroll.basic_salary,
        allowances: payroll.allowances || {},
        overtime_amount: payroll.overtime_amount,
        bonus: payroll.bonus,
        gross_salary: payroll.gross_salary
      },
      deductions: payroll.deductions || {},
      net_salary: payroll.net_salary,
      payment_details: {
        payment_method: payroll.payment_method,
        payment_status: payroll.payment_status,
        payment_date: payroll.payment_date
      },
      generated_at: new Date()
    };

    res.status(200).json({
      success: true,
      data: payslip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payroll statistics
// @route   GET /api/v1/payroll/stats
// @access  Private (HR/Admin)
exports.getPayrollStats = async (req, res, next) => {
  try {
    const { department, year, month } = req.query;

    const where = {};
    if (year) where.year = year;
    if (month) where.month = month;

    const includeOptions = {
      model: Employee,
      as: 'employee',
      attributes: []
    };

    if (department) {
      includeOptions.where = { department };
    }

    const totalPayroll = await Payroll.count({
      where,
      include: department ? [includeOptions] : []
    });

    const totalPaid = await Payroll.sum('net_salary', {
      where: { ...where, payment_status: 'paid' },
      include: department ? [includeOptions] : []
    });

    const totalPending = await Payroll.sum('net_salary', {
      where: { ...where, payment_status: 'pending' },
      include: department ? [includeOptions] : []
    });

    const avgSalary = await Payroll.findOne({
      attributes: [
        [Payroll.sequelize.fn('AVG', Payroll.sequelize.col('net_salary')), 'avg']
      ],
      where,
      include: department ? [includeOptions] : [],
      raw: true
    });

    const payrollByStatus = await Payroll.findAll({
      attributes: [
        'payment_status',
        [Payroll.sequelize.fn('COUNT', Payroll.sequelize.col('Payroll.id')), 'count'],
        [Payroll.sequelize.fn('SUM', Payroll.sequelize.col('net_salary')), 'total_amount']
      ],
      where,
      include: department ? [includeOptions] : [],
      group: ['payment_status'],
      raw: true
    });

    const payrollByDepartment = await Payroll.findAll({
      attributes: [
        [Payroll.sequelize.col('employee.department'), 'department'],
        [Payroll.sequelize.fn('COUNT', Payroll.sequelize.col('Payroll.id')), 'count'],
        [Payroll.sequelize.fn('SUM', Payroll.sequelize.col('net_salary')), 'total_amount'],
        [Payroll.sequelize.fn('AVG', Payroll.sequelize.col('net_salary')), 'avg_salary']
      ],
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: []
        }
      ],
      group: ['employee.department'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        total_records: totalPayroll,
        total_paid: totalPaid || 0,
        total_pending: totalPending || 0,
        average_salary: parseFloat((avgSalary?.avg || 0).toFixed(2)),
        by_status: payrollByStatus,
        by_department: payrollByDepartment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create payroll for all employees
// @route   POST /api/v1/payroll/bulk-create
// @access  Private (HR/Admin)
exports.bulkCreatePayroll = async (req, res, next) => {
  try {
    const { month, year, employees } = req.body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return next(new ErrorResponse('Employees array is required', 400));
    }

    const payrollRecords = [];
    const errors = [];

    for (const emp of employees) {
      try {
        // Check if employee exists
        const employee = await Employee.findByPk(emp.employee_id);
        if (!employee) {
          errors.push({ employee_id: emp.employee_id, error: 'Employee not found' });
          continue;
        }

        // Check if payroll already exists
        const existing = await Payroll.findOne({
          where: { employee_id: emp.employee_id, month, year }
        });

        if (existing) {
          errors.push({ employee_id: emp.employee_id, error: 'Payroll already exists' });
          continue;
        }

        // Calculate salary
        const totalAllowances = emp.allowances
          ? Object.values(emp.allowances).reduce((sum, val) => sum + parseFloat(val || 0), 0)
          : 0;

        const totalDeductions = emp.deductions
          ? Object.values(emp.deductions).reduce((sum, val) => sum + parseFloat(val || 0), 0)
          : 0;

        const gross_salary = parseFloat(emp.basic_salary) + totalAllowances + parseFloat(emp.overtime_amount || 0) + parseFloat(emp.bonus || 0);
        const net_salary = gross_salary - totalDeductions;

        payrollRecords.push({
          employee_id: emp.employee_id,
          month,
          year,
          basic_salary: emp.basic_salary,
          allowances: emp.allowances,
          deductions: emp.deductions,
          overtime_amount: emp.overtime_amount || 0,
          bonus: emp.bonus || 0,
          gross_salary,
          net_salary,
          payment_status: 'pending',
          payment_method: emp.payment_method || 'bank_transfer'
        });
      } catch (error) {
        errors.push({ employee_id: emp.employee_id, error: error.message });
      }
    }

    // Bulk create payroll
    const created = await Payroll.bulkCreate(payrollRecords);

    res.status(201).json({
      success: true,
      message: `Created ${created.length} payroll records`,
      data: {
        created: created.length,
        errors: errors.length,
        error_details: errors
      }
    });
  } catch (error) {
    next(error);
  }
};
