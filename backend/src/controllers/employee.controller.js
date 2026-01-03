const { Employee, User, Attendance, Leave } = require('../models');
const { Op } = require('sequelize');
const ErrorResponse = require('../utils/errorResponse');
const moment = require('moment');

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private (HR/Admin)
exports.getAllEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      designation,
      employment_type,
      status
    } = req.query;

    const offset = (page - 1) * limit;

    // Build filter conditions
    const where = {};

    // By default, exclude inactive/terminated employees unless explicitly filtering
    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.notIn]: ['inactive', 'terminated'] };
    }

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employee_code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (department) where.department = department;
    if (designation) where.designation = designation;
    if (employment_type) where.employment_type = employment_type;

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'is_verified']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const employeesWithStatus = await Promise.all(employees.map(async (emp) => {
      const today = moment().format('YYYY-MM-DD');

      // Check Attendance
      const attendance = await Attendance.findOne({
        where: { employee_id: emp.id, date: today }
      });

      // Check Leave
      const leave = await Leave.findOne({
        where: {
          employee_id: emp.id,
          status: 'approved',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        }
      });

      let status = 'Absent';
      if (attendance && attendance.status === 'present') status = 'Present';
      else if (attendance && attendance.status === 'half_day') status = 'Half Day';
      else if (leave) status = 'On Leave';

      return {
        ...emp.toJSON(),
        todayStatus: status
      };
    }));

    res.status(200).json({
      success: true,
      count: employees.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: employeesWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'is_verified', 'created_at']
        }
      ]
    });

    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Employees can only view their own profile
    if (req.user.role === 'employee' && employee.id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to view this profile', 403));
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current employee profile
// @route   GET /api/v1/employees/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const employee_id = req.user.employeeProfile?.id;

    if (!employee_id) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    const employee = await Employee.findOne({
      where: { id: employee_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'is_verified', 'created_at']
        }
      ]
    });

    if (!employee) {
      return next(new ErrorResponse('Employee profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Private (HR/Admin)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      user_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      employee_code,
      date_of_joining,
      employment_type,
      department,
      designation,
      reporting_manager,
      work_location,
      documents
    } = req.body;

    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({ where: { user_id } });
    if (existingEmployee) {
      return next(new ErrorResponse('Employee profile already exists for this user', 400));
    }

    // Check if employee code is unique
    if (employee_code) {
      const codeExists = await Employee.findOne({ where: { employee_code } });
      if (codeExists) {
        return next(new ErrorResponse('Employee code already exists', 400));
      }
    }

    const employee = await Employee.create({
      user_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      employee_code,
      date_of_joining,
      employment_type,
      department,
      designation,
      reporting_manager,
      work_location,
      documents
    });

    // Update user's employee_id
    await User.update(
      { employee_id: employee.id },
      { where: { id: user_id } }
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Define fields that employees can edit themselves
    const employeeEditableFields = [
      'phone',
      'address',
      'city',
      'state',
      'country',
      'postal_code',
      'emergency_contact_name',
      'emergency_contact_phone',
      'emergency_contact_relation',
      'profile_picture'
    ];

    // Define fields only HR/Admin can edit
    const adminOnlyFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'gender',
      'employee_code',
      'date_of_joining',
      'employment_type',
      'department',
      'designation',
      'reporting_manager',
      'work_location',
      'status',
      'documents'
    ];

    // Check permissions
    if (req.user.role === 'employee') {
      // Employees can only update their own profile
      if (employee.id !== req.user.employeeProfile?.id) {
        return next(new ErrorResponse('Not authorized to update this profile', 403));
      }

      // Check if trying to update restricted fields
      const requestedFields = Object.keys(req.body);
      const restrictedFields = requestedFields.filter(
        field => !employeeEditableFields.includes(field)
      );

      if (restrictedFields.length > 0) {
        return next(
          new ErrorResponse(
            `You are not authorized to update these fields: ${restrictedFields.join(', ')}`,
            403
          )
        );
      }
    }

    // Recalculate salary components if basic_salary is updated
    if (req.body.basic_salary) {
      const { calculateSalaryComponents } = require('../utils/helpers');
      const salaryComponents = calculateSalaryComponents(req.body.basic_salary);
      Object.assign(req.body, salaryComponents);
    }

    // Update employee
    await employee.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Private (Admin only)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Check if already deleted
    if (employee.status === 'inactive' || employee.status === 'terminated') {
      return next(new ErrorResponse('Employee already deleted', 400));
    }

    // Soft delete by updating status
    await employee.update({ status: 'inactive' });

    // Also deactivate the associated user account
    if (employee.user) {
      await employee.user.update({ is_verified: false });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: { id: employee.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload employee profile picture
// @route   POST /api/v1/employees/:id/upload-picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // Check permissions
    if (req.user.role === 'employee' && employee.id !== req.user.employeeProfile?.id) {
      return next(new ErrorResponse('Not authorized to update this profile picture', 403));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Update profile picture path
    await employee.update({ profile_picture: req.file.path });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture: req.file.path
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee statistics
// @route   GET /api/v1/employees/stats
// @access  Private (HR/Admin)
exports.getEmployeeStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'active' } });
    const inactiveEmployees = await Employee.count({ where: { status: 'inactive' } });

    const employeesByDepartment = await Employee.findAll({
      attributes: [
        'department',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['department'],
      raw: true
    });

    const employeesByType = await Employee.findAll({
      attributes: [
        'employment_type',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['employment_type'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        byDepartment: employeesByDepartment,
        byEmploymentType: employeesByType
      }
    });
  } catch (error) {
    next(error);
  }
};
