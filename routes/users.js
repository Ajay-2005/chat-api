const express = require('express');
const router = express.Router();

const userController = require('../controllers/user_controller');
const authMiddleware = require("../middleware/auth_middleware");

router.use(express.json());

// Example routes with valid callback functions
router.get("/users", userController.getAllusers);
router.get("/users/:id", authMiddleware, userController.getUserById);

router.post("/register", userController.doSignup);
router.post("/verify-signup", userController.otpVerifyDuringSignup);
router.post("/login", userController.dologin);
router.post("/send-resetlink", userController.sendResetlink);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
