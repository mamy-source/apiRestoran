import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const requiredNumber = (name, defaultValue)=>{
  const value = Number(process.env[name]);
  if (isNaN(value)){
    return defaultValue;
  }
  return value;
}

export const env = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Database (MySQL)
  // DB_HOST: process.env.DB_HOST || 'localhost',
  // DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  // DB_USER: process.env.DB_USER || 'root',
  // DB_PASSWORD: process.env.DB_PASSWORD || '',
  // DB_NAME: process.env.DB_NAME || 'resto_db',
  // DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Argon2
  ARGON2_MEMORY_COST: requiredNumber("ARGON2_MEMORY_COST", 65536),
  ARGON2_TIME_COST: requiredNumber("ARGON2_TIME_COST", 3),
  ARGON2_PARALLELISM: requiredNumber("ARGON2_PARALLELISM", 2),

  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_EXPIRES_IN: process.env.SESSION_EXPIRES_IN || '30d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  
  // Rate Limit (default values)
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || './logs',
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validation des variables obligatoires
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!env[envVar] && env.NODE_ENV !== 'test') {
    console.error(` Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}