/**
 * User Routes
 *
 * Routes for user management (admin only)
 * GET /users - Get all users with filtering/pagination
 * GET /users/:id - Get single user
 * PATCH /users/:id/role - Update user role
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, allowedTo } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(auth);
router.use(allowedTo('admin'));

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id/role', userController.updateUserRole);

module.exports = router;
