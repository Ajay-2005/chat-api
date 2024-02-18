const express = require('express')
const router = express()
const usercontroller = require('../controllers/user_controller')
router.use(express.json())
router.post("/register", usercontroller.doSignup)

module.exports=router