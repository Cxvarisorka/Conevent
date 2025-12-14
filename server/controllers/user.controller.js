/**
 * User Controller
 *
 * Handles user management operations for admin panel:
 * - Get all users with filtering and pagination
 * - Search users by email
 * - Update user roles
 */

const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Get all users
 * Supports filtering, searching, sorting, and pagination
 * Admin only endpoint
 */
const getAllUsers = catchAsync(async (req, res, next) => {
    // Get total count for pagination
    const totalQuery = new APIFeatures(User.find(), req.query)
        .filter()
        .search();
    const total = await User.countDocuments(totalQuery.query.getFilter());

    // Execute query with all features
    const features = new APIFeatures(User.find(), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();

    const users = await features.query.select('-passwordHash');

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: 'success',
        results: users.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            users
        }
    });
});

/**
 * Get single user by ID
 * Admin only endpoint
 */
const getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * Update user role
 * Admin only endpoint
 * @param {string} req.params.id - User ID
 * @param {string} req.body.role - New role (user, admin, organisation)
 */
const updateUserRole = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'organisation'];
    if (!role || !validRoles.includes(role)) {
        return next(new AppError('Invalid role. Must be user, admin, or organisation', 400));
    }

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        }
    });
});

module.exports = {
    getAllUsers,
    getUser,
    updateUserRole
};
