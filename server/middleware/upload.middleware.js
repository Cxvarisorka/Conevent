const multer = require('multer');
const AppError = require('../utils/appError');

// Configure multer to store files in memory
const multerStorage = multer.memoryStorage();

// Filter to only accept images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Wrapper to handle multer errors properly
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File size too large. Maximum size is 5MB', 400));
          }
          return next(new AppError(err.message, 400));
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for uploading organisation images (logo and cover)
exports.uploadOrganisationImages = handleUpload(upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]));

// Middleware for uploading event images
exports.uploadEventImages = handleUpload(upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]));

// Single image upload
exports.uploadSingle = (fieldName) => handleUpload(upload.single(fieldName));
