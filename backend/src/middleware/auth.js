const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Employee,
            as: 'employeeProfile',
            required: false
          }
        ]
      });

      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      if (!user.is_active) {
        return next(new ErrorResponse('Your account has been deactivated', 403));
      }

      req.user = user;
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Grant access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Check if email is verified
 */
exports.requireVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return next(
      new ErrorResponse('Please verify your email to access this resource', 403)
    );
  }
  next();
};
