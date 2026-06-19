import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';
import auditMiddleware from '../middlewares/audit.middleware.js';

function expressLoader(app) {
  // Security headers
  app.use(helmet());
  
  // CORS configuration
  const corsOptions = {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : '*',
    credentials: env.CORS_CREDENTIALS === true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Total-Pages'],
  };
  
  app.use(cors(corsOptions));
  
  
  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Cookie parser
  app.use(cookieParser());
  app.use(auditMiddleware())
  
  // Trust proxy (for rate limiting behind proxy)
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  // Static files for uploads
  app.use('/uploads', express.static('uploads'));
  
  // Request logging in development
  if (env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.url} - ${req.ip}`);
      next();
    });
  }
  
  logger.info('Express middlewares configured');
  
  return app;
}

export default expressLoader;