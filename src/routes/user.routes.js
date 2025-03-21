const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
  getUsersFilterValidator,
} = require("../validators/user.validator");
const validate = require("../middlewares/validator.middleware");

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getUsersFilterValidator,
  validate,
  (req, res, next) => {
    console.log("Filter :", req.query);
    return userController.getUsersWithFilters(req, res);
  }
);

// Create new user (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createUserValidator,
  validate,
  userController.createUser
);

// Update user (own profile or admin)
router.put(
  "/:id",
  authenticate,
  updateUserValidator,
  validate,
  async (req, res, next) => {
    // Allow users to update their own profile
    if (req.user.id === parseInt(req.params.id) || req.user.role === "admin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden. You do not have permission to access this resource.",
    });
  },
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userIdValidator,
  validate,
  userController.deleteUser
);

module.exports = router;
