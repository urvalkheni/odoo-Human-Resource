const { Attendance, Employee, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const moment = require('moment');

// @desc    Check-in
// @route   POST /api/v1/attendance/check-in
// @access  Private (Employee)
exports.checkIn = async (req, res, next) => {
  try {
    const { location, ip_address, notes } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (existingAttendance) {
      if (existingAttendance.check_in) {
        return next(new ErrorResponse('Already checked in today', 400));
      }
    }

    // Format time as HH:mm:ss for PostgreSQL TIME field
    const check_in_time = moment().format('HH:mm:ss');

    // Create or update attendance record
    const [attendance, created] = await Attendance.upsert({
      employee_id,
      date: today,
      check_in: check_in_time,
      status: 'present',
      location: location || null,
      ip_address: ip_address || req.ip,
      notes: notes || null
    }, {
      returning: true
    });

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: {
        id: attendance.id,
        check_in: attendance.check_in,
        date: attendance.date,
        status: attendance.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out
// @route   POST /api/v1/attendance/check-out
// @access  Private (Employee)
exports.checkOut = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (!attendance) {
      return next(new ErrorResponse('No check-in record found for today', 404));
    }

    if (attendance.check_out) {
      return next(new ErrorResponse('Already checked out today', 400));
    }

    if (!attendance.check_in) {
      return next(new ErrorResponse('Cannot check out without checking in', 400));
    }

    // Format time as HH:mm:ss for PostgreSQL TIME field
    const check_out_time = moment().format('HH:mm:ss');

    // Calculate working hours from TIME strings
    const check_in_moment = moment(attendance.check_in, 'HH:mm:ss');
    const check_out_moment = moment(check_out_time, 'HH:mm:ss');
    const diffHrs = check_out_moment.diff(check_in_moment, 'hours', true);
    const working_hours = parseFloat(Math.max(0, diffHrs).toFixed(2));

    // Calculate overtime (if more than 8 hours)
    const overtime_hours = working_hours > 8 ? parseFloat((working_hours - 8).toFixed(2)) : 0;

    // Determine status based on working hours
    let status = 'present';
    if (working_hours < 4) {
      status = 'half_day';
    }

    // Update attendance record
    await attendance.update({
      check_out: check_out_time,
      working_hours,
      overtime_hours,
      status,
      notes: notes || attendance.notes
    });

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: {
        id: attendance.id,
        check_in: attendance.check_in,
        check_out: attendance.check_out,
        working_hours: attendance.working_hours,
        overtime_hours: attendance.overtime_hours,
        status: attendance.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance
// @route   GET /api/v1/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'first_name', 'last_name', 'employee_code']
        }
      ]
    });

    if (!attendance) {
      return res.status(200).json({
        success: true,
        message: 'No attendance record for today',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my attendance history
// @route   GET /api/v1/attendance/my-history
// @access  Private (Employee)
exports.getMyAttendanceHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      start_date,
      end_date,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Build filter conditions
    const where = { employee_id };

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      where.date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      where.date = {
        [Op.lte]: end_date
      };
    }

    if (status) where.status = status;

    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    // Calculate summary statistics
    const totalPresent = await Attendance.count({
      where: { employee_id, status: 'present' }
    });

    const totalAbsent = await Attendance.count({
      where: { employee_id, status: 'absent' }
    });

    const totalHalfDay = await Attendance.count({
      where: { employee_id, status: 'half_day' }
    });

    const totalWorkingHours = await Attendance.sum('working_hours', {
      where: { employee_id }
    });

    const totalOvertimeHours = await Attendance.sum('overtime_hours', {
      where: { employee_id }
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      summary: {
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalWorkingHours: parseFloat((totalWorkingHours || 0).toFixed(2)),
        totalOvertimeHours: parseFloat((totalOvertimeHours || 0).toFixed(2))
      },
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private (HR/Admin)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee_id,
      start_date,
      end_date,
      status,
      department
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filter conditions
    const where = {};

    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      where.date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      where.date = {
        [Op.lte]: end_date
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

    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where,
      include: [includeOptions],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['check_in', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance by employee ID
// @route   GET /api/v1/attendance/employee/:employeeId
// @access  Private (HR/Admin)
exports.getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const {
      page = 1,
      limit = 10,
      start_date,
      end_date,
      status
    } = req.query;

    const offset = (page - 1) * limit;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Build filter conditions
    const where = { employee_id: employeeId };

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }

    if (status) where.status = status;

    const { count, rows: attendance } = await Attendance.findAndCountAll({
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
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark employee absent (bulk operation)
// @route   POST /api/v1/attendance/mark-absent
// @access  Private (HR/Admin)
exports.markAbsent = async (req, res, next) => {
  try {
    const { employee_ids, date } = req.body;

    if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return next(new ErrorResponse('Employee IDs array is required', 400));
    }

    const targetDate = date || moment().format('YYYY-MM-DD');

    // Check which employees don't have attendance record for the date
    const existingAttendance = await Attendance.findAll({
      where: {
        employee_id: { [Op.in]: employee_ids },
        date: targetDate
      },
      attributes: ['employee_id']
    });

    const existingEmployeeIds = existingAttendance.map(a => a.employee_id);
    const absentEmployeeIds = employee_ids.filter(id => !existingEmployeeIds.includes(id));

    // Create absent records
    const absentRecords = absentEmployeeIds.map(employee_id => ({
      employee_id,
      date: targetDate,
      status: 'absent',
      working_hours: 0,
      overtime_hours: 0
    }));

    await Attendance.bulkCreate(absentRecords);

    res.status(200).json({
      success: true,
      message: `Marked ${absentRecords.length} employees as absent`,
      data: {
        marked_absent: absentRecords.length,
        already_recorded: existingEmployeeIds.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/v1/attendance/:id
// @access  Private (HR/Admin)
exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    const allowedUpdates = ['status', 'notes', 'check_in', 'check_out', 'working_hours', 'overtime_hours'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return next(new ErrorResponse('Invalid updates', 400));
    }

    // Recalculate working hours if check_in or check_out changed
    if (req.body.check_in || req.body.check_out) {
      const check_in = new Date(req.body.check_in || attendance.check_in);
      const check_out = new Date(req.body.check_out || attendance.check_out);

      if (check_out && check_in) {
        const diffMs = check_out - check_in;
        const diffHrs = diffMs / (1000 * 60 * 60);
        req.body.working_hours = parseFloat(diffHrs.toFixed(2));
        req.body.overtime_hours = req.body.working_hours > 8 ?
          parseFloat((req.body.working_hours - 8).toFixed(2)) : 0;
      }
    }

    await attendance.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Private (Admin only)
exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    await attendance.destroy();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance statistics
// @route   GET /api/v1/attendance/stats
// @access  Private (HR/Admin)
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const { start_date, end_date, department } = req.query;

    const where = {};

    if (start_date && end_date) {
      where.date = {
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

    const totalPresent = await Attendance.count({
      where: { ...where, status: 'present' },
      include: department ? [includeOptions] : []
    });

    const totalAbsent = await Attendance.count({
      where: { ...where, status: 'absent' },
      include: department ? [includeOptions] : []
    });

    const totalHalfDay = await Attendance.count({
      where: { ...where, status: 'half_day' },
      include: department ? [includeOptions] : []
    });

    const totalLeave = await Attendance.count({
      where: { ...where, status: 'leave' },
      include: department ? [includeOptions] : []
    });

    const avgWorkingHours = await Attendance.findOne({
      attributes: [
        [Attendance.sequelize.fn('AVG', Attendance.sequelize.col('working_hours')), 'avg']
      ],
      where,
      include: department ? [includeOptions] : [],
      raw: true
    });

    const totalOvertimeHours = await Attendance.sum('overtime_hours', {
      where,
      include: department ? [includeOptions] : []
    });

    res.status(200).json({
      success: true,
      data: {
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalLeave,
        averageWorkingHours: parseFloat((avgWorkingHours?.avg || 0).toFixed(2)),
        totalOvertimeHours: parseFloat((totalOvertimeHours || 0).toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};
