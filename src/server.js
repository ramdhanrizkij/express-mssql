require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const { logger } = require("./config/logger");

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  // Dalam production, mungkin ingin melakukan graceful shutdown
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    reason: reason.toString(),
    stack: reason.stack || "No stack trace available",
  });
});

// Database connection
connectDB()
  .then(() => {
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || "development",
      });
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
