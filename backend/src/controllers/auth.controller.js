const { User, Employee, Company } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken, generateVerificationToken } = require('../utils/token');
const { sendVerificationEmail, sendResetPasswordEmail, sendCredentialsEmail } = require('../utils/email');
const { generateEmployeeId, generateRandomPassword, calculateSalaryComponents } = require('../utils/helpers');

/**
 * @desc    Register user (HR/Admin only)
 * @route   POST /api/v1/auth/signup
 * @access  Private (HR/Admin)
 */
exports.signup = async (req, res, next) => {
  try {
    const {
      email,
      first_name,
      last_name,
      date_of_joining,
      company_id,
      department,
      designation,
      basic_salary,
      role,
      phone,
      date_of_birth,
      gender,
      employment_type
    } = req.body;

    // Check if user is HR or Admin (uncomment when authentication middleware is active)
    // if (req.user && !['hr', 'admin'].includes(req.user.role)) {
    //   return next(new ErrorResponse('Only HR or Admin can create employee accounts', 403));
    // }

    // Validate required fields
    if (!company_id || !email || !first_name || !last_name) {
      return next(new ErrorResponse('Company ID, email, first name, and last name are required', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Get company details
    const company = await Company.findByPk(company_id);
    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    if (!company.is_active) {
      return next(new ErrorResponse('Company is not active', 400));
    }

    // Get current year
    const yearOfJoining = date_of_joining ? new Date(date_of_joining).getFullYear() : new Date().getFullYear();

    // Generate employee ID (async function)
    const employee_id = (await generateEmployeeId(
      company.short_name.trim(),
      first_name.trim(),
      last_name.trim(),
      yearOfJoining
    )).trim();

    // Auto-generate password
    const generatedPassword = generateRandomPassword();

    // Calculate salary components (validate basic_salary first)
    const salaryComponents = calculateSalaryComponents(basic_salary || 0);

    // Create user
    const user = await User.create({
      employee_id,
      email,
      password: generatedPassword,
      role: role || 'employee',
      is_verified: true // Auto-verify accounts created by HR/Admin
    });

    // Create employee profile with salary details
    const employee = await Employee.create({
      user_id: user.id,
      company_id: company_id,
      first_name,
      last_name,
      date_of_joining: date_of_joining || new Date(),
      phone,
      date_of_birth,
      gender,
      department,
      designation,
      employment_type: employment_type || 'permanent',
      ...salaryComponents
    });

    // Send email with generated credentials
    try {
      await sendCredentialsEmail(email, employee_id, generatedPassword);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue execution, do not fail signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully. Credentials have been sent to the employee email.',
      data: {
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        temporary_password: generatedPassword, // Remove this in production
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          company: company.name,
          net_salary: employee.net_salary
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/signin
 * @access  Public
 */
exports.signin = async (req, res, next) => {
  try {
    const { email, employee_id, password } = req.body;

    // Validate input
    if ((!email && !employee_id) || !password) {
      return next(new ErrorResponse('Please provide (email or employee_id) and password', 400));
    }

    // Build where clause based on provided credential (trim whitespace)
    const whereClause = email
      ? { email: email.trim() }
      : { employee_id: employee_id.trim() };

    // Check for user
    const user = await User.findOne({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employeeProfile'
        }
      ]
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches (trim password too)
    const trimmedPassword = password.trim();
    console.log('🔐 Password check:');
    console.log('  - Provided password length:', trimmedPassword.length);
    console.log('  - Stored hash length:', user.password.length);
    const isMatch = await user.comparePassword(trimmedPassword);
    console.log('  - Match result:', isMatch);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.is_active) {
      return next(new ErrorResponse('Your account has been deactivated', 403));
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Create token
    const token = generateToken(user.id);

    // Set cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        profile: user.employeeProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { verification_token: token }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    user.is_verified = true;
    user.verification_token = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Employee,
          as: 'employeeProfile'
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email }
    });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(20).toString('hex');

    user.reset_password_token = resetToken;
    user.reset_password_expire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        reset_password_token: req.params.token,
        reset_password_expire: { [require('sequelize').Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.reset_password_token = null;
    user.reset_password_expire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.comparePassword(current_password);

    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = new_password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
