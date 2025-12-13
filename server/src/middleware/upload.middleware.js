const multer = require('multer');
const { storage, profileStorage } = require('../config/cloudinary.config');
const AppError = require('../utils/appError');

/**
 * Configure multer for file uploads
 * Maximum 4 images, 5MB per file
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new AppError('Only image files are allowed (JPG, PNG, WEBP)', 400);
      cb(error, false);
    }
  },
});

/**
 * Error handler for multer errors
 * Converts multer errors to AppError instances
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size too large. Maximum size is 5MB per file.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Maximum 4 images allowed.', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field. Use "images" field for uploads.', 400));
    }
    return next(new AppError(err.message || 'File upload error', 400));
  }
  // If it's already an AppError, pass it along
  if (err instanceof AppError) {
    return next(err);
  }
  // For other errors, pass to next error handler
  next(err);
};

/**
 * Middleware to upload up to 4 images
 * Files will be available in req.files array
 * Wrapped with error handler
 */
const uploadEventImages = (req, res, next) => {
  upload.array('images', 4)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

/**
 * Middleware to upload a single image
 * Wrapped with error handler
 */
const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

/**
 * Configure multer for profile image uploads
 * Single image, 5MB max
 */
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new AppError('Only image files are allowed (JPG, PNG, WEBP)', 400);
      cb(error, false);
    }
  },
});

/**
 * Middleware to upload profile image
 * Wrapped with error handler
 */
const uploadProfileImage = (req, res, next) => {
  profileUpload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

module.exports = {
  upload,
  uploadEventImages,
  uploadSingleImage,
  uploadProfileImage
};

