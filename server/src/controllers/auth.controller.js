const Student = require('../models/student.model');
const University = require('../models/university.model');
const { generateToken } = require('../utils/jwt');
const {
  getGoogleAuthUrlStudent,
  getGoogleAuthUrlUniversity,
  getGoogleUserInfo
} = require('../utils/googleAuth');
const config = require('../config/index.config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Standard Login for Students
exports.studentLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const student = await Student.findOne({ email });
  if (!student || !student.passwordHash) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isValid = await student.verifyPassword(password);
  if (!isValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken({ id: student._id, type: 'student' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    student
  });
});

// Standard Signup for Students
exports.studentSignup = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return next(new AppError('Please provide email, password, and name', 400));
  }

  const existing = await Student.findOne({ email });
  if (existing) {
    return next(new AppError('Email already exists', 400));
  }

  const student = await Student.create({ email, passwordHash: password, name });

  const token = generateToken({ id: student._id, type: 'student' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.status(201).json({
    success: true,
    student
  });
});

// Standard Login for Universities
exports.universityLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const university = await University.findOne({ email });
  if (!university || !university.passwordHash) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isValid = await university.verifyPassword(password);
  if (!isValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken({ id: university._id, type: 'university' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({
    success: true,
    university
  });
});

// Standard Signup for Universities
exports.universitySignup = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return next(new AppError('Please provide email, password, and name', 400));
  }

  const existing = await University.findOne({ email });
  if (existing) {
    return next(new AppError('Email already exists', 400));
  }

  const university = await University.create({ email, passwordHash: password, name });

  const token = generateToken({ id: university._id, type: 'university' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.status(201).json({
    success: true,
    university
  });
});

/**
 * Redirect to Google OAuth for Student Login
 * @route   GET /api/v1/auth/google/student
 */
exports.googleStudentRedirect = (req, res) => {
  const authUrl = getGoogleAuthUrlStudent();
  res.redirect(authUrl);
};

/**
 * Handle Google OAuth Callback for Student
 * @route   GET /api/v1/auth/google/student/callback
 */
exports.googleStudentCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code not provided', 400));
  }

  // Get user info from Google
  const googleUser = await getGoogleUserInfo(code, config.google.studentCallbackUrl);

  // Find or create student
  let student = await Student.findOne({ email: googleUser.email });

  if (!student) {
    student = await Student.create({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.avatar
    });
  } else if (!student.googleId) {
    student.googleId = googleUser.googleId;
    student.avatar = googleUser.avatar;
    await student.save();
  }

  // Generate JWT token
  const token = generateToken({ id: student._id, type: 'student' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  // Redirect to frontend
  res.redirect(`${config.frontendUrl}/student/dashboard`);
});

/**
 * Redirect to Google OAuth for University Login
 * @route   GET /api/v1/auth/google/university
 */
exports.googleUniversityRedirect = (req, res) => {
  const authUrl = getGoogleAuthUrlUniversity();
  res.redirect(authUrl);
};

/**
 * Handle Google OAuth Callback for University
 * @route   GET /api/v1/auth/google/university/callback
 */
exports.googleUniversityCallback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code not provided', 400));
  }

  // Get user info from Google
  const googleUser = await getGoogleUserInfo(code, config.google.universityCallbackUrl);

  // Find or create university
  let university = await University.findOne({ email: googleUser.email });

  if (!university) {
    university = await University.create({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      logo: googleUser.avatar
    });
  } else if (!university.googleId) {
    university.googleId = googleUser.googleId;
    university.logo = googleUser.avatar;
    await university.save();
  }

  // Generate JWT token
  const token = generateToken({ id: university._id, type: 'university' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

  // Redirect to frontend
  res.redirect(`${config.frontendUrl}/university/dashboard`);
});

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out'
  });
};

// Get Current User
exports.me = (req, res) => {
  res.json({
    success: true,
    user: req.user,
    type: req.userType
  });
};

// Update Student Profile
exports.updateStudentProfile = catchAsync(async (req, res, next) => {
  const { name, bio } = req.body;

  // Get the student
  const student = await Student.findById(req.user._id);

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  // Update fields
  if (name) student.name = name;
  if (bio !== undefined) student.bio = bio;

  // Handle avatar upload if provided
  if (req.file) {
    student.avatar = req.file.path; // Cloudinary URL
  }

  await student.save();

  res.json({
    success: true,
    student
  });
});

// Update University Profile
exports.updateUniversityProfile = catchAsync(async (req, res, next) => {
  const { name, bio } = req.body;

  // Get the university
  const university = await University.findById(req.user._id);

  if (!university) {
    return next(new AppError('University not found', 404));
  }

  // Update fields
  if (name) university.name = name;
  if (bio !== undefined) university.bio = bio;

  // Handle logo upload if provided
  if (req.file) {
    university.logo = req.file.path; // Cloudinary URL
  }

  await university.save();

  res.json({
    success: true,
    university
  });
});
