import databaseLoader from './database.loader.js';
import expressLoader from './express.loader.js';
import routesLoader from './routes.loader.js';
import middlewareLoader from './middleware.loader.js';
import logger from '../libs/logger.lib.js';
import { errorHandler } from '../middlewares/error.middleware.js';

/**
 * Loader principal - manomboka ny zava-drehetra
 */
async function initLoaders(app) {
  try {
    // 1. Database (Prisma)
    await databaseLoader();
    logger.info(' Database loader initialized');

    // 2. Express middlewares de base (helmet, cors, json, etc.)
    expressLoader(app);
    logger.info(' Express loader initialized');

    // 3. Middlewares personnalisés (rateLimit, guestSession, etc.)
    middlewareLoader(app);
    logger.info('Middleware loader initialized');

    // 4. Routes (API endpoints)
    routesLoader(app);
    logger.info('Routes loader initialized');

    // 5. Error handler (farany indrindra)
    app.use(errorHandler);
    logger.info('Error handler initialized');

    logger.info('All loaders completed successfully');
  } catch (error) {
    logger.error(' Failed to initialize loaders:', error);
    throw error;
  }
}

export default initLoaders;