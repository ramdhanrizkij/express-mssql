const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validator.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/profile", authenticate, authController.profile);
module.exports = router;
