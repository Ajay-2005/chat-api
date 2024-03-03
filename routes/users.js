const express = require('express')
const router = express()
const usercontroller = require('../controllers/user_controller')
router.use(express.json())


router.post("/register", usercontroller.doSignup)
router.post("/verify-signup",usercontroller.otpVerifyDuringSignup)
router.post("/login",usercontroller.dologin)
router.post("/send-resetlink",usercontroller.sendResetlink)
router.post("/reset-password",usercontroller.resetPassword)
module.exports=router