const express = require('express')
const router = express()

const usercontroller = require('../controllers/user_controller')

const authmiddleware = require("../middleware/auth_middleware")
router.use(express.json())

router.get("/users", authmiddleware,usercontroller.getAllusers)
router.get("/users/:id",authmiddleware, usercontroller.getUserById)

router.post("/register", usercontroller.doSignup)
router.post("/verify-signup", usercontroller.otpVerifyDuringSignup)
router.post("/login", usercontroller.dologin)
router.post("/send-resetlink", usercontroller.sendResetlink)
router.post("/reset-password", usercontroller.resetPassword)

module.exports = router