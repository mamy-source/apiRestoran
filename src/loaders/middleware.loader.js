import rateLimitMiddleware from '../middlewares/rateLimit.middleware.js';
// import guestSessionMiddleware from '../middlewares/guest.middleware.js';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';

function middlewareLoader(app) {
  // Global rate limiting (ny API rehetra)
  // Skip rate limiting in test environment
  if (env.NODE_ENV !== 'test') {
    app.use(rateLimitMiddleware);
    logger.info('Rate limiting middleware loaded');
  }
  
  // Guest session (ho an'ny client tsy misy compte)
//   app.use(guestSessionMiddleware);
//   logger.info('Guest session middleware loaded');
  
  // Additional security headers (if needed)
  app.use((req, res, next) => {
    // Disable X-Powered-By header
    res.removeHeader('X-Powered-By');
    next();
  });
  
  logger.info('Custom middlewares configured');
  
  return app;
}

export default middlewareLoader;