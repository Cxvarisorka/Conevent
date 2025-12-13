const { verifyToken } = require('../utils/jwt');
const Student = require('../models/student.model');
const University = require('../models/university.model');

/**
 * Authentication middleware - Verifies JWT token and loads user
 * Attaches user object and userType to request
 */
exports.auth = async (req, res, next) => {
  try {
    // Extract token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Load user from database based on type
    if (decoded.type === 'student') {
      req.user = await Student.findById(decoded.id);
    } else if (decoded.type === 'university') {
      req.user = await University.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Attach user type to request for role-based access
    req.userType = decoded.type;
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based middleware - Checks if user is a student
 * Must be used after auth middleware
 */
exports.isStudent = (req, res, next) => {
  if (!req.userType) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access this resource.'
    });
  }

  next();
};

/**
 * Role-based middleware - Checks if user is a university
 * Must be used after auth middleware
 */
exports.isUniversity = (req, res, next) => {
  if (!req.userType) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.userType !== 'university') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only universities can access this resource.'
    });
  }

  next();
};

/**
 * Combined middleware - Authenticate and verify student role
 * Convenience middleware that combines auth + isStudent
 */
exports.requireStudent = [exports.auth, exports.isStudent];

/**
 * Combined middleware - Authenticate and verify university role
 * Convenience middleware that combines auth + isUniversity
 */
exports.requireUniversity = [exports.auth, exports.isUniversity];

/**
 * Flexible role-based middleware - Accepts multiple allowed roles
 * Usage: requireRole('student', 'university')
 */
exports.requireRole = (...allowedRoles) => {
  return [
    exports.auth,
    (req, res, next) => {
      if (!allowedRoles.includes(req.userType)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }
      next();
    }
  ];
};
