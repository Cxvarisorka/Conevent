const AppError = require('../utils/appError');
const config = require('../config/index.config');

/**
 * Handle Mongoose CastError (Invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = errors.join('. ');
  return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Token Error
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

/**
 * Handle Multer Upload Errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large. Maximum size is 5MB per file', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum 4 images allowed', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Use "images" field for uploads', 400);
  }
  return new AppError(err.message || 'File upload error', 400);
};

/**
 * Handle JSON Syntax Error
 */
const handleJSONError = () => {
  return new AppError('Invalid JSON format in request body', 400);
};

/**
 * Send Error Response in Development Mode
 */
const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    error: {
      statusCode,
      status: err.status,
      isOperational: err.isOperational,
      stack: err.stack
    }
  });
};

/**
 * Send Error Response in Production Mode
 */
const sendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }
  // Programming or unknown error: log and send generic message
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later'
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || (err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error');

  if (config.env === 'development') {
    // In development, show detailed errors
    sendErrorDev(err, res);
  } else {
    // In production, handle specific error types
    let error = Object.create(err);
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.isOperational = err.isOperational;

    // Handle Mongoose CastError
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }
    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    // Handle Multer Errors
    if (err.name === 'MulterError') {
      error = handleMulterError(err);
    }
    // Handle JSON Syntax Errors
    if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      error = handleJSONError();
    }

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const message = `Cannot find ${req.originalUrl} on this server`;
  next(new AppError(message, 404));
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};
