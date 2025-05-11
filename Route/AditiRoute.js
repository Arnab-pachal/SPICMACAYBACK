const express = require('express');
const router = express.Router();
const {AditiUpload,AditiGet } = require('../Controllers/AditiController');
const upload  = require('../Config/multer');
const isLoggedin = require('../Middleware/isLoggedin.js');

router.post('/aditiupload',isLoggedin, upload.single('file'), AditiUpload);
router.get('/aditiget', AditiGet);

module.exports = router