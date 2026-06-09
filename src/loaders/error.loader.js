import { errorHandler, notFoundHandler } from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';

/**
 * Error loader - handles all error-related middleware
 */
function errorLoader(app) {
  // Not found handler
  app.use(notFoundHandler);
  
  // Global error handler
  app.use(errorHandler);
  
  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application continues running
  });
  
  // Uncaught exception handler
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Graceful shutdown
    process.exit(1);
  });
  
  logger.info('Error handlers configured');
  
  return app;
}

export default errorLoader;