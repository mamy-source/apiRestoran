import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), env.LOG_DIR || "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Safe JSON stringify (support BigInt)
const safeStringify = (obj) =>
  JSON.stringify(
    obj,
    (_, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value,
    2
  );

// Custom development format
const devFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0
        ? `\nMetadata: ${safeStringify(meta)}`
        : "";

    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
  }
);

// Production format
const prodFormat = winston.format.json();

// Choose format based on environment
const logFormat =
  env.NODE_ENV === "production"
    ? prodFormat
    : devFormat;

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({
      stack: true,
    }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Console logging (development)
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      devFormat
    ),
  })
);

// File logging (production)
if (
  env.NODE_ENV === "production" ||
  env.LOG_TO_FILE === "true"
) {
  // Errors only
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: winston.format.json(),
    })
  );

  // All logs
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: winston.format.json(),
    })
  );

  // HTTP logs
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "http.log"),
      level: "http",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: winston.format.json(),
    })
  );
}

export default {
  error: (message, meta = {}) =>
    logger.error(message, meta),

  warn: (message, meta = {}) =>
    logger.warn(message, meta),

  info: (message, meta = {}) =>
    logger.info(message, meta),

  http: (message, meta = {}) =>
    logger.http(message, meta),

  debug: (message, meta = {}) =>
    logger.debug(message, meta),

  silly: (message, meta = {}) =>
    logger.silly(message, meta),

  // Request logging
  logRequest: (req, duration) => {
    logger.http(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      duration: `${duration}ms`,
      userId:
        req.user?.id ||
        req.guest?.id ||
        "anonymous",
    });
  },

  // Database query logging
  logQuery: (
    model,
    action,
    duration,
    data = {}
  ) => {
    logger.debug(`Prisma: ${model}.${action}`, {
      model,
      action,
      duration: `${duration}ms`,
      ...data,
    });
  },

  // Business events logging
  logEvent: (
    event,
    userId,
    details = {}
  ) => {
    logger.info(`Event: ${event}`, {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },
};