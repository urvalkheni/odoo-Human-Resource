const { Employee, Attendance, Leave, Payroll, User } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const moment = require('moment');

// @desc    Get employee dashboard data
// @route   GET /api/v1/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeDashboard = async (req, res, next) => {
  try {
    // Get employee_id from the associated employeeProfile (UUID), not from user.employee_id (string code)
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found. Please contact admin.', 404));
    }

    // Get employee profile
    const employee = await Employee.findByPk(employee_id, {
      attributes: ['id', 'first_name', 'last_name', 'department', 'designation', 'date_of_joining']
    });

    if (!employee) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    // Today's attendance
    const today = moment().format('YYYY-MM-DD');
    const todayAttendance = await Attendance.findOne({
      where: { employee_id, date: today }
    });

    // Attendance statistics (current month)
    const monthStart = moment().startOf('month').format('YYYY-MM-DD');
    const monthEnd = moment().endOf('month').format('YYYY-MM-DD');

    const monthlyAttendance = await Attendance.count({
      where: {
        employee_id,
        date: { [Op.between]: [monthStart, monthEnd] },
        status: 'present'
      }
    });

    const totalWorkingHours = await Attendance.sum('working_hours', {
      where: {
        employee_id,
        date: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    const totalOvertimeHours = await Attendance.sum('overtime_hours', {
      where: {
        employee_id,
        date: { [Op.between]: [monthStart, monthEnd] }
      }
    });

    // Leave statistics
    const totalLeaves = await Leave.count({ where: { employee_id } });
    const pendingLeaves = await Leave.count({
      where: { employee_id, status: 'pending' }
    });
    const approvedLeavesDays = await Leave.sum('number_of_days', {
      where: { employee_id, status: 'approved' }
    });

    // Recent leaves (last 5)
    const recentLeaves = await Leave.findAll({
      where: { employee_id },
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'leave_type', 'start_date', 'end_date', 'number_of_days', 'status']
    });

    // Latest payroll
    const latestPayroll = await Payroll.findOne({
      where: { employee_id },
      order: [['year', 'DESC'], ['month', 'DESC']],
      attributes: ['id', 'month', 'year', 'net_salary', 'payment_status', 'payment_date']
    });

    // Recent attendance (last 7 days)
    const weekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const recentAttendance = await Attendance.findAll({
      where: {
        employee_id,
        date: { [Op.gte]: weekAgo }
      },
      order: [['date', 'DESC']],
      attributes: ['id', 'date', 'check_in', 'check_out', 'working_hours', 'status']
    });

    res.status(200).json({
      success: true,
      data: {
        profile: employee,
        today_attendance: todayAttendance,
        attendance_stats: {
          monthly_present_days: monthlyAttendance,
          total_working_hours: parseFloat((totalWorkingHours || 0).toFixed(2)),
          total_overtime_hours: parseFloat((totalOvertimeHours || 0).toFixed(2))
        },
        leave_stats: {
          total_applications: totalLeaves,
          pending_applications: pendingLeaves,
          approved_days: approvedLeavesDays || 0
        },
        recent_leaves: recentLeaves,
        latest_payroll: latestPayroll,
        recent_attendance: recentAttendance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get HR/Admin dashboard data
// @route   GET /api/v1/dashboard/admin
// @access  Private (HR/Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const { department } = req.query;

    // Build department filter
    const departmentFilter = department ? { department } : {};

    // Total employees
    const totalEmployees = await Employee.count({
      where: { status: 'active', ...departmentFilter }
    });

    // Today's attendance statistics
    const today = moment().format('YYYY-MM-DD');

    // 1. Get Present Count (Employees with check-in today)
    const todayPresent = await Attendance.count({
      where: {
        date: today,
        status: { [Op.in]: ['present', 'half_day'] }
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    // 2. Get On Leave Count (Employees with Approved Leave today)
    const onLeaveCount = await Leave.count({
      where: {
        status: 'approved',
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today }
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    // 3. Calculate Absent (Total - Present - On Leave)
    // Ensure absent is not negative in edge cases
    const calculatedAbsent = Math.max(0, totalEmployees - todayPresent - onLeaveCount);

    // Prepare stats object
    const stats = {
      present: todayPresent,
      absent: calculatedAbsent,
      on_leave: onLeaveCount,
      half_day: 0 // Included in present usually, or can be separate if needed
    };

    // Pending leave approvals
    const pendingLeaves = await Leave.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Employee,
          as: 'employee',
          where: departmentFilter,
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department']
        }
      ],
      limit: 10,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'leave_type', 'start_date', 'end_date', 'number_of_days', 'reason', 'created_at']
    });

    // Monthly attendance summary
    const monthStart = moment().startOf('month').format('YYYY-MM-DD');
    const monthEnd = moment().endOf('month').format('YYYY-MM-DD');

    const monthlyPresent = await Attendance.count({
      where: {
        date: { [Op.between]: [monthStart, monthEnd] },
        status: 'present'
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    const monthlyAbsent = await Attendance.count({
      where: {
        date: { [Op.between]: [monthStart, monthEnd] },
        status: 'absent'
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    const monthlyLeaves = await Attendance.count({
      where: {
        date: { [Op.between]: [monthStart, monthEnd] },
        status: 'leave'
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    // Payroll statistics (current month)
    const currentMonth = moment().month() + 1;
    const currentYear = moment().year();

    const totalPayroll = await Payroll.sum('net_salary', {
      where: { month: currentMonth, year: currentYear },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    const paidPayroll = await Payroll.sum('net_salary', {
      where: { month: currentMonth, year: currentYear, payment_status: 'paid' },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    const pendingPayroll = await Payroll.sum('net_salary', {
      where: { month: currentMonth, year: currentYear, payment_status: 'pending' },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : []
    });

    // Employees by department
    const employeesByDepartment = await Employee.findAll({
      attributes: [
        'department',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      where: { status: 'active', ...departmentFilter },
      group: ['department'],
      raw: true
    });

    // Recent joinings (last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const recentJoinings = await Employee.count({
      where: {
        date_of_joining: { [Op.gte]: thirtyDaysAgo },
        ...departmentFilter
      }
    });

    // Top overtime employees (this month)
    const topOvertimeEmployees = await Attendance.findAll({
      attributes: [
        'employee_id',
        [Attendance.sequelize.fn('SUM', Attendance.sequelize.col('overtime_hours')), 'total_overtime']
      ],
      where: {
        date: { [Op.between]: [monthStart, monthEnd] }
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          where: departmentFilter,
          attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department']
        }
      ],
      group: ['employee_id', 'employee.id', 'employee.first_name', 'employee.last_name',
        'employee.employee_code', 'employee.department'],
      order: [[Attendance.sequelize.literal('total_overtime'), 'DESC']],
      limit: 5,
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_employees: totalEmployees,
          recent_joinings: recentJoinings
        },
        today_attendance: {
          present: stats.present,
          absent: stats.absent,
          half_day: 0,
          on_leave: stats.on_leave,
          attendance_percentage: totalEmployees > 0
            ? ((stats.present / totalEmployees) * 100).toFixed(2)
            : 0
        },
        monthly_attendance: {
          present: monthlyPresent,
          absent: monthlyAbsent,
          leave: monthlyLeaves
        },
        leave_management: {
          pending_approvals: pendingLeaves.length,
          pending_leaves_list: pendingLeaves
        },
        payroll_summary: {
          total_payroll: totalPayroll || 0,
          paid: paidPayroll || 0,
          pending: pendingPayroll || 0
        },
        employees_by_department: employeesByDepartment,
        top_overtime_employees: topOvertimeEmployees
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance trends
// @route   GET /api/v1/dashboard/attendance-trends
// @access  Private (HR/Admin)
exports.getAttendanceTrends = async (req, res, next) => {
  try {
    const { days = 30, department } = req.query;

    const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    // Get daily attendance counts
    const attendanceTrends = await Attendance.findAll({
      attributes: [
        'date',
        'status',
        [Attendance.sequelize.fn('COUNT', Attendance.sequelize.col('Attendance.id')), 'count']
      ],
      where: {
        date: { [Op.between]: [startDate, endDate] }
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : [],
      group: ['date', 'status'],
      order: [['date', 'ASC']],
      raw: true
    });

    // Format the data for frontend charting
    const formattedData = {};
    attendanceTrends.forEach(record => {
      if (!formattedData[record.date]) {
        formattedData[record.date] = {
          date: record.date,
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0
        };
      }
      formattedData[record.date][record.status] = parseInt(record.count);
    });

    const trendsArray = Object.values(formattedData);

    res.status(200).json({
      success: true,
      data: trendsArray
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave trends
// @route   GET /api/v1/dashboard/leave-trends
// @access  Private (HR/Admin)
exports.getLeaveTrends = async (req, res, next) => {
  try {
    const { months = 6, department } = req.query;

    const startDate = moment().subtract(months, 'months').startOf('month').format('YYYY-MM-DD');

    // Get monthly leave counts by type
    const leaveTrends = await Leave.findAll({
      attributes: [
        [Leave.sequelize.fn('DATE_TRUNC', 'month', Leave.sequelize.col('start_date')), 'month'],
        'leave_type',
        [Leave.sequelize.fn('COUNT', Leave.sequelize.col('Leave.id')), 'count'],
        [Leave.sequelize.fn('SUM', Leave.sequelize.col('number_of_days')), 'total_days']
      ],
      where: {
        start_date: { [Op.gte]: startDate },
        status: 'approved'
      },
      include: department ? [{
        model: Employee,
        as: 'employee',
        where: { department },
        attributes: []
      }] : [],
      group: [
        Leave.sequelize.fn('DATE_TRUNC', 'month', Leave.sequelize.col('start_date')),
        'leave_type'
      ],
      order: [[Leave.sequelize.fn('DATE_TRUNC', 'month', Leave.sequelize.col('start_date')), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: leaveTrends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick stats
// @route   GET /api/v1/dashboard/quick-stats
// @access  Private
exports.getQuickStats = async (req, res, next) => {
  try {
    const isAdmin = ['hr', 'admin'].includes(req.user.role);
    const employee_id = req.user.employeeProfile?.id;

    if (isAdmin) {
      // Admin quick stats
      const totalEmployees = await Employee.count({ where: { status: 'active' } });

      const today = moment().format('YYYY-MM-DD');
      const presentToday = await Attendance.count({
        where: { date: today, status: 'present' }
      });

      const pendingLeaves = await Leave.count({ where: { status: 'pending' } });

      const currentMonth = moment().month() + 1;
      const currentYear = moment().year();
      const pendingPayroll = await Payroll.count({
        where: { month: currentMonth, year: currentYear, payment_status: 'pending' }
      });

      res.status(200).json({
        success: true,
        data: {
          total_employees: totalEmployees,
          present_today: presentToday,
          pending_leaves: pendingLeaves,
          pending_payroll: pendingPayroll
        }
      });
    } else {
      // Employee quick stats
      const today = moment().format('YYYY-MM-DD');
      const todayAttendance = await Attendance.findOne({
        where: { employee_id, date: today }
      });

      const pendingLeaves = await Leave.count({
        where: { employee_id, status: 'pending' }
      });

      const monthStart = moment().startOf('month').format('YYYY-MM-DD');
      const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
      const monthlyPresent = await Attendance.count({
        where: {
          employee_id,
          date: { [Op.between]: [monthStart, monthEnd] },
          status: 'present'
        }
      });

      res.status(200).json({
        success: true,
        data: {
          checked_in: todayAttendance ? !!todayAttendance.check_in : false,
          checked_out: todayAttendance ? !!todayAttendance.check_out : false,
          pending_leaves: pendingLeaves,
          monthly_present_days: monthlyPresent
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for insights
// @route   GET /api/v1/dashboard/analytics
// @access  Private (HR/Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const { department } = req.query;
    const departmentFilter = department ? { department } : {};

    // 1. Fetch all active employees with their stats
    const employees = await Employee.findAll({
      where: { status: 'active', ...departmentFilter },
      attributes: ['id', 'first_name', 'last_name', 'department', 'designation', 'date_of_joining', 'profile_picture']
    });

    const monthStart = moment().startOf('month').format('YYYY-MM-DD');
    const monthEnd = moment().endOf('month').format('YYYY-MM-DD');
    const lastMonthStart = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');

    const analyticsData = await Promise.all(employees.map(async (emp) => {
      // Fetch Attendance Stats (Current Month)
      const workingHours = await Attendance.sum('working_hours', {
        where: {
          employee_id: emp.id,
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const presentDays = await Attendance.count({
        where: {
          employee_id: emp.id,
          date: { [Op.between]: [monthStart, monthEnd] },
          status: 'present'
        }
      });

      // Fetch Leaves (Current Year)
      const leavesTaken = await Leave.sum('number_of_days', {
        where: {
          employee_id: emp.id,
          status: 'approved',
          start_date: { [Op.gte]: moment().startOf('year').toDate() }
        }
      }) || 0;

      // Calculate Scores
      // Assuming 22 working days * 8 hours = 176 hours approx
      const avgDailyHours = presentDays > 0 ? (workingHours / presentDays).toFixed(1) : 0;
      const attendancePercentage = (presentDays / 22) * 100; // Approx based on 22 working days

      let status = 'Neutral';
      let recommendation = 'None';

      // Logic for "Needs Hike" (High Performance)
      // High avg hours (> 8.5) and good attendance (> 90%)
      if (avgDailyHours > 8.5 && attendancePercentage > 90) {
        status = 'High Performer';
        recommendation = 'Consider for Hike';
      }
      // Logic for "At Risk" (Low Performance/Attendance)
      else if (attendancePercentage < 60 || avgDailyHours < 6) {
        status = 'At Risk';
        recommendation = 'Needs Attention';
      }

      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department,
        designation: emp.designation,
        total_working_hours: parseFloat(workingHours.toFixed(2)),
        avg_daily_hours: parseFloat(avgDailyHours),
        present_days: presentDays,
        leaves_taken: leavesTaken,
        performance_status: status,
        recommendation: recommendation,
        avatar: emp.profile_picture
      };
    }));

    // Calculate Average Stats for Chart (Department wise)
    const deptStats = {};
    analyticsData.forEach(d => {
      if (!deptStats[d.department]) {
        deptStats[d.department] = {
          department: d.department,
          total_hours: 0,
          count: 0,
          avg_hours: 0,
          total_leaves: 0
        };
      }
      deptStats[d.department].total_hours += d.total_working_hours;
      deptStats[d.department].total_leaves += d.leaves_taken;
      deptStats[d.department].count += 1;
    });

    // Normalize dept stats
    const chartData = Object.values(deptStats).map(d => ({
      name: d.department,
      avg_hours: parseFloat((d.total_hours / d.count).toFixed(1)),
      avg_leaves: parseFloat((d.total_leaves / d.count).toFixed(1))
    }));

    res.status(200).json({
      success: true,
      data: {
        employees: analyticsData,
        chart_data: chartData,
        insights: {
          top_performers: analyticsData.filter(e => e.performance_status === 'High Performer'),
          at_risk: analyticsData.filter(e => e.performance_status === 'At Risk')
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
