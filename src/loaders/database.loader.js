import prisma from '../config/prisma.js';
import logger from '../libs/logger.lib.js';

async function databaseLoader() {
  try {
    // Test the connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Optional: Run a test query
    if (process.env.NODE_ENV === 'development') {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      logger.debug('📊 Database test query successful', { result });
    }
    
    return prisma;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default databaseLoader;
export { prisma };