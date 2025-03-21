// File: src/config/logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Pastikan direktori logs ada
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Konfigurasi format log
const { format } = winston;
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Buat logger dengan beberapa transport (console dan file)
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "user-api" },
  transports: [
    // Tulis semua log dengan level 'error' dan lebih rendah ke 'error.log'
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Tulis semua log dengan level ke 'combined.log'
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Tidak menghentikan aplikasi jika ada error pada winston
  exitOnError: false,
});

// Jika bukan di production, cetak juga ke console dengan format yang lebih manusiawi
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    })
  );
}

// Buat middleware untuk logging HTTP requests
const httpLogger = (req, res, next) => {
  const startHrTime = process.hrtime();

  // Logging saat request diterima
  logger.info(`Incoming request`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Jalankan next middleware
  next();

  // Tangkap response
  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    // Log durasi dan status response
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](`Outgoing response`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${elapsedTimeInMs.toFixed(2)}ms`,
    });
  });
};

// Export logger dan middlewares
module.exports = {
  logger,
  httpLogger,
  // Shortcut functions
  error: (message, meta) => logger.error(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  info: (message, meta) => logger.info(message, meta),
  debug: (message, meta) => logger.debug(message, meta),
};
