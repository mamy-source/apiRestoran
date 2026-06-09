import logger from '../libs/logger.lib.js';
import {env} from '../config/env.js';
/**
 * Not Found handler (404)
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;
  
  // Log the error (tsy ao amin'ny test environment)
  if (env.NODE_ENV !== 'test') {
    logger.error(` Error: ${message}`, {
      statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id || req.guest?.id || 'anonymous',
      stack: err.stack,
      errors: err.errors,
    });
  }
  
  // ❗️ Prisma specific errors
  if (err.code) {
    switch (err.code) {
      // Unique constraint violation
      case 'P2002':
        statusCode = 409;
        const field = err.meta?.target?.[0] || 'field';
        message = `⚠️ Duplicate value for ${field}. This ${field} already exists.`;
        break;
      
      // Foreign key constraint violation
      case 'P2003':
        statusCode = 400;
        message = `⚠️ Invalid reference: ${err.meta?.field_name || 'Related record'} not found.`;
        break;
      
      // Record not found
      case 'P2025':
        statusCode = 404;
        message = ` Record not found.`;
        break;
      
      // Invalid data
      case 'P2000':
      case 'P2001':
      case 'P2005':
      case 'P2006':
      case 'P2007':
      case 'P2008':
      case 'P2009':
      case 'P2010':
      case 'P2011':
      case 'P2012':
      case 'P2013':
      case 'P2014':
      case 'P2015':
      case 'P2016':
      case 'P2017':
      case 'P2018':
      case 'P2019':
      case 'P2020':
      case 'P2021':
      case 'P2022':
      case 'P2023':
      case 'P2024':
        statusCode = 400;
        message = `⚠️ Invalid data: ${err.message}`;
        break;
      
      default:
        // Keep default values
        break;
    }
  }
  
  // ❗️ JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = ' Invalid token. Please login again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = ' Token expired. Please login again.';
  }
  
  // ❗️ Validation errors (Joi, express-validator, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = ' Validation error';
    errors = err.details || err.errors;
  }
  
  // ❗️ Development only: add stack trace
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };
  
  // Add stack trace only in development
  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }
  
  // Add validation errors if exist
  if (errors) {
    response.errors = errors;
  }
  
  // Send response
  res.status(statusCode).json(response);
};

/**
 * Async wrapper to avoid try/catch repetition
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}