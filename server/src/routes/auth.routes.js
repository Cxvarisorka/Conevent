const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');
const { uploadProfileImage } = require('../middleware/upload.middleware');

// ============================================
// Public Routes - No Authentication Required
// ============================================

/**
 * @route   POST /api/v1/auth/student/signup
 * @desc    Student signup with email/password
 * @access  Public
 */
router.post('/student/signup', authController.studentSignup);

/**
 * @route   POST /api/v1/auth/student/login
 * @desc    Student login with email/password
 * @access  Public
 */
router.post('/student/login', authController.studentLogin);

/**
 * @route   POST /api/v1/auth/university/signup
 * @desc    University signup with email/password
 * @access  Public
 */
router.post('/university/signup', authController.universitySignup);

/**
 * @route   POST /api/v1/auth/university/login
 * @desc    University login with email/password
 * @access  Public
 */
router.post('/university/login', authController.universityLogin);

/**
 * @route   GET /api/v1/auth/google/student
 * @desc    Redirect to Google OAuth for student login
 * @access  Public
 */
router.get('/google/student', authController.googleStudentRedirect);

/**
 * @route   GET /api/v1/auth/google/student/callback
 * @desc    Handle Google OAuth callback for students
 * @access  Public
 */
router.get('/google/student/callback', authController.googleStudentCallback);

/**
 * @route   GET /api/v1/auth/google/university
 * @desc    Redirect to Google OAuth for university login
 * @access  Public
 */
router.get('/google/university', authController.googleUniversityRedirect);

/**
 * @route   GET /api/v1/auth/google/university/callback
 * @desc    Handle Google OAuth callback for universities
 * @access  Public
 */
router.get('/google/university/callback', authController.googleUniversityCallback);

// ============================================
// Protected Routes - Authentication Required
// ============================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clears auth token)
 * @access  Private (Any authenticated user)
 */
router.post('/logout', auth, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user profile
 * @access  Private (Any authenticated user)
 */
router.get('/me', auth, authController.me);

/**
 * @route   PUT /api/v1/auth/student/profile
 * @desc    Update student profile (name, bio, avatar)
 * @access  Private (Student only)
 */
router.put('/student/profile', auth, uploadProfileImage, authController.updateStudentProfile);

/**
 * @route   PUT /api/v1/auth/university/profile
 * @desc    Update university profile (name, bio, logo)
 * @access  Private (University only)
 */
router.put('/university/profile', auth, uploadProfileImage, authController.updateUniversityProfile);

module.exports = router;
