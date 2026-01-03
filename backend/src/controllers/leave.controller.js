const { Leave, Employee, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const { sendLeaveApprovalEmail } = require('../utils/email');
const moment = require('moment');

// @desc    Apply for leave
// @route   POST /api/v1/leaves
// @access  Private (Employee)
exports.applyLeave = async (req, res, next) => {
  try {
    const {
      leave_type,
      start_date,
      end_date,
      reason,
      attachments
    } = req.body;

    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Validate dates
    const start = moment(start_date).startOf('day');
    const end = moment(end_date).startOf('day');
    const today = moment().startOf('day');

    if (end.isBefore(start)) {
      return next(new ErrorResponse('End date must be after start date', 400));
    }

    if (start.isBefore(today)) {
      return next(new ErrorResponse('Cannot apply for leave in the past', 400));
    }

    // Calculate number of days
    const number_of_days = end.diff(start, 'days') + 1;

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      where: {
        employee_id,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          {
            start_date: { [Op.between]: [start_date, end_date] }
          },
          {
            end_date: { [Op.between]: [start_date, end_date] }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });

    if (overlappingLeave) {
      return next(new ErrorResponse('You already have a leave application for these dates', 400));
    }

    // Create leave application
    const leave = await Leave.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      number_of_days,
      reason,
      attachments,
      status: 'pending'
    });

    // Get employee details for notification
    const employee = await Employee.findByPk(employee_id, {
      include: [{ model: User, as: 'user', attributes: ['email'] }]
    });

    // Send notification to HR/Admin (optional - implement based on your needs)
    // You can fetch all HR/Admin users and send them emails

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leave applications
// @route   GET /api/v1/leaves/my-leaves
// @access  Private (Employee)
exports.getMyLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leave_type,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Build filter conditions
    const where = { employee_id };

    if (status) where.status = status;
    if (leave_type) where.leave_type = leave_type;

    if (start_date && end_date) {
      where.start_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const { count, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email'],
          include: [
            {
              model: Employee,
              as: 'employeeProfile',
              attributes: ['first_name', 'last_name']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Calculate leave summary
    const totalLeaves = await Leave.count({ where: { employee_id } });
    const approvedLeaves = await Leave.count({
      where: { employee_id, status: 'approved' }
    });
    const pendingLeaves = await Leave.count({
      where: { employee_id, status: 'pending' }
    });
    const rejectedLeaves = await Leave.count({
      where: { employee_id, status: 'rejected' }
    });

    const totalLeaveDays = await Leave.sum('number_of_days', {
      where: { employee_id, status: 'approved' }
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      summary: {
        total: totalLeaves,
        approved: approvedLeaves,
        pending: pendingLeaves,
        rejected: rejectedLeaves,
        totalDaysTaken: totalLeaveDays || 0
      },
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave applications
// @route   GET /api/v1/leaves
// @access  Private (HR/Admin)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leave_type,
      employee_id,
      department,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filter conditions
    const where = {};

    if (status) where.status = status;
    if (leave_type) where.leave_type = leave_type;
    if (employee_id) where.employee_id = employee_id;

    if (start_date && end_date) {
      where.start_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Include filters
    const includeOptions = {
      model: Employee,
      as: 'employee',
      attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department', 'designation']
    };

    if (department) {
      includeOptions.where = { department };
    }

    const { count, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        includeOptions,
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email'],
          include: [
            {
              model: Employee,
              as: 'employeeProfile',
              attributes: ['first_name', 'last_name']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave by ID
// @route   GET /api/v1/leaves/:id
// @access  Private
exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email']
            }
          ]
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email'],
          include: [
            {
              model: Employee,
              as: 'employeeProfile',
              attributes: ['first_name', 'last_name']
            }
          ]
        }
      ]
    });

    if (!leave) {
      return next(new ErrorResponse('Leave application not found', 404));
    }

    // Employees can only view their own leaves
    if (req.user.role === 'employee' && leave.employee_id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to view this leave application', 403));
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject leave
// @route   PUT /api/v1/leaves/:id/status
// @access  Private (HR/Admin)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, approval_remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Status must be either approved or rejected', 400));
    }

    const leave = await Leave.findByPk(req.params.id, {
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

    if (!leave) {
      return next(new ErrorResponse('Leave application not found', 404));
    }

    if (leave.status !== 'pending') {
      return next(new ErrorResponse('Only pending leave applications can be approved/rejected', 400));
    }

    // Update leave status
    await leave.update({
      status,
      approved_by: req.user.id,
      approval_remarks,
      approval_date: new Date()
    });

    // Send email notification to employee
    try {
      await sendLeaveApprovalEmail(
        leave.employee.user.email,
        {
          employeeName: `${leave.employee.first_name} ${leave.employee.last_name}`,
          leaveType: leave.leave_type,
          startDate: leave.start_date,
          endDate: leave.end_date,
          numberOfDays: leave.number_of_days,
          status,
          remarks: approval_remarks
        }
      );
    } catch (emailError) {
      console.error('Failed to send leave approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave application
// @route   PUT /api/v1/leaves/:id
// @access  Private (Employee - own leaves only)
exports.updateLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return next(new ErrorResponse('Leave application not found', 404));
    }

    // Only employee who applied can update
    if (leave.employee_id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to update this leave application', 403));
    }

    // Can only update pending leaves
    if (leave.status !== 'pending') {
      return next(new ErrorResponse('Only pending leave applications can be updated', 400));
    }

    const {
      leave_type,
      start_date,
      end_date,
      reason,
      attachments
    } = req.body;

    // Recalculate number of days if dates changed
    let number_of_days = leave.number_of_days;
    if (start_date || end_date) {
      const start = moment(start_date || leave.start_date);
      const end = moment(end_date || leave.end_date);

      if (end.isBefore(start)) {
        return next(new ErrorResponse('End date must be after start date', 400));
      }

      number_of_days = end.diff(start, 'days') + 1;
    }

    await leave.update({
      leave_type: leave_type || leave.leave_type,
      start_date: start_date || leave.start_date,
      end_date: end_date || leave.end_date,
      number_of_days,
      reason: reason || leave.reason,
      attachments: attachments || leave.attachments
    });

    res.status(200).json({
      success: true,
      message: 'Leave application updated successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel leave application
// @route   PUT /api/v1/leaves/:id/cancel
// @access  Private (Employee)
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return next(new ErrorResponse('Leave application not found', 404));
    }

    // Only employee who applied can cancel
    if (leave.employee_id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to cancel this leave application', 403));
    }

    // Can only cancel pending or approved leaves
    if (!['pending', 'approved'].includes(leave.status)) {
      return next(new ErrorResponse('Only pending or approved leaves can be cancelled', 400));
    }

    // Check if leave has already started
    if (moment(leave.start_date).isBefore(moment().startOf('day'))) {
      return next(new ErrorResponse('Cannot cancel leave that has already started', 400));
    }

    await leave.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Leave application cancelled successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete leave application
// @route   DELETE /api/v1/leaves/:id
// @access  Private (Admin only)
exports.deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return next(new ErrorResponse('Leave application not found', 404));
    }

    await leave.destroy();

    res.status(200).json({
      success: true,
      message: 'Leave application deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave statistics
// @route   GET /api/v1/leaves/stats
// @access  Private (HR/Admin)
exports.getLeaveStats = async (req, res, next) => {
  try {
    const { department, start_date, end_date } = req.query;

    const where = {};

    if (start_date && end_date) {
      where.start_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const includeOptions = {
      model: Employee,
      as: 'employee',
      attributes: []
    };

    if (department) {
      includeOptions.where = { department };
    }

    const totalLeaves = await Leave.count({
      where,
      include: department ? [includeOptions] : []
    });

    const pendingLeaves = await Leave.count({
      where: { ...where, status: 'pending' },
      include: department ? [includeOptions] : []
    });

    const approvedLeaves = await Leave.count({
      where: { ...where, status: 'approved' },
      include: department ? [includeOptions] : []
    });

    const rejectedLeaves = await Leave.count({
      where: { ...where, status: 'rejected' },
      include: department ? [includeOptions] : []
    });

    const cancelledLeaves = await Leave.count({
      where: { ...where, status: 'cancelled' },
      include: department ? [includeOptions] : []
    });

    const leavesByType = await Leave.findAll({
      attributes: [
        'leave_type',
        [Leave.sequelize.fn('COUNT', Leave.sequelize.col('Leave.id')), 'count'],
        [Leave.sequelize.fn('SUM', Leave.sequelize.col('number_of_days')), 'total_days']
      ],
      where,
      include: department ? [includeOptions] : [],
      group: ['leave_type'],
      raw: true
    });

    const totalLeaveDays = await Leave.sum('number_of_days', {
      where: { ...where, status: 'approved' },
      include: department ? [includeOptions] : []
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalLeaves,
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        cancelled: cancelledLeaves,
        totalDaysTaken: totalLeaveDays || 0,
        byType: leavesByType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave balance for employee
// @route   GET /api/v1/leaves/balance/:employeeId
// @access  Private (HR/Admin or self)
exports.getLeaveBalance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // Check authorization
    if (req.user.role === 'employee' && req.user.employeeProfile?.id !== employeeId) {
      return next(new ErrorResponse('Not authorized to view leave balance', 403));
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Get current year leaves
    const currentYear = moment().year();
    const yearStart = moment().startOf('year').format('YYYY-MM-DD');
    const yearEnd = moment().endOf('year').format('YYYY-MM-DD');

    const leavesTaken = await Leave.findAll({
      attributes: [
        'leave_type',
        [Leave.sequelize.fn('SUM', Leave.sequelize.col('number_of_days')), 'days_taken']
      ],
      where: {
        employee_id: employeeId,
        status: 'approved',
        start_date: {
          [Op.between]: [yearStart, yearEnd]
        }
      },
      group: ['leave_type'],
      raw: true
    });

    // Define leave entitlements (customize based on your policy)
    const leaveEntitlements = {
      paid: 20,
      sick: 12,
      casual: 10,
      unpaid: 999,
      maternity: 90,
      paternity: 15
    };

    const leaveBalance = Object.keys(leaveEntitlements).map(type => {
      const taken = leavesTaken.find(l => l.leave_type === type);
      const daysTaken = taken ? parseInt(taken.days_taken) : 0;
      const entitled = leaveEntitlements[type];

      return {
        leave_type: type,
        entitled,
        taken: daysTaken,
        balance: entitled === 999 ? 'Unlimited' : entitled - daysTaken
      };
    });

    res.status(200).json({
      success: true,
      data: {
        employee_id: employeeId,
        year: currentYear,
        leave_balance: leaveBalance
      }
    });
  } catch (error) {
    next(error);
  }
};
