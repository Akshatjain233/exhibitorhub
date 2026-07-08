const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  let message = err.message || 'Server Error';
  let statusCode = err.statusCode || 500;
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  return errorResponse(res, statusCode, message, err.errors || []);
};

module.exports = errorHandler;
