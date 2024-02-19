const express = require('express')
const router = express()
const usercontroller = require('../controllers/user_controller')
router.use(express.json())


router.post("/register", usercontroller.doSignup)
router.post("/login",usercontroller.dologin)

module.exports=router