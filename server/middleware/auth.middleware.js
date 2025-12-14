/**
 * Authentication Middleware
 *
 * Handles JWT token verification and role-based access control.
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const Organisation = require('../models/organisation.model');
const Event = require('../models/event.model');
const AppError = require('../utils/appError');

/**
 * Authenticate request using JWT token
 * Extracts token from cookies or Authorization header
 */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

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
 * Check if user has one of the allowed roles
 * @param  {...string} roles - Allowed roles (defaults to 'admin')
 * @returns {Function} Middleware function
 */
const allowedTo = (...roles) => {
  // If no roles provided, default to admin
  if (roles.length === 0) {
    roles = ['admin'];
  }

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`
      });
    }
    next();
  };
};

/**
 * Check if user is admin or organisation admin for event management
 * Allows: Global admins OR users in the organisation's admins array
 */
const canManageEvent = async (req, res, next) => {
  try {
    // Global admins can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    let organisationId;

    // For creating events - get organisationId from request body
    if (req.method === 'POST') {
      organisationId = req.body.organisationId;
    }
    // For updating/deleting events - get organisationId from the event
    else if (req.method === 'PUT' || req.method === 'DELETE') {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      organisationId = event.organisationId;
    }

    if (!organisationId) {
      return res.status(400).json({
        success: false,
        message: 'Organisation ID is required'
      });
    }

    // Check if organisation exists and user is in admins array
    const organisation = await Organisation.findById(organisationId);
    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: 'Organisation not found'
      });
    }

    // Ensure admins array exists and check if user is admin
    const adminsArray = organisation.admins || [];
    const userId = req.user._id.toString();
    const isOrgAdmin = adminsArray.some(
      adminId => adminId && adminId.toString() === userId
    );

    if (!isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage events for this organisation'
      });
    }

    next();
  } catch (error) {
    console.error('Event management authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

module.exports = {
  auth,
  allowedTo,
  canManageEvent
};
