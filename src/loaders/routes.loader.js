import apiRoutes from '../routes/index.js';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';

function routesLoader(app) {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });
  
  // Readiness probe (for k8s)
  app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'ready' });
  });
  
  // Liveness probe (for k8s)
  app.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
  });
  
  // API routes
  app.use('/api', apiRoutes);
  
  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });
  
  logger.info('Routes configured');
  
  return app;
}

export default routesLoader;