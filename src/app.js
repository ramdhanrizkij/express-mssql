const express = require("express");
const app = express();
const { httpLogger } = require("./config/logger");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Middlewares
app.use(httpLogger);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware (updated)
app.use((err, req, res, next) => {
  const { logger } = require("./config/logger");

  // Log error dengan stack trace
  logger.error(`${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  const { logger } = require("./config/logger");

  logger.warn(`Route not found: ${req.method} ${req.url}`);

  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
