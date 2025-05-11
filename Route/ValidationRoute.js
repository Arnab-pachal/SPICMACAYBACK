
const express = require('express');
const router = express.Router();
const { check,verifyOTP,contact} = require('../Controllers/validationController');


router.post('/check', check);
router.post('/verify-otp',verifyOTP);
router.post('/contact',contact);

module.exports = router


