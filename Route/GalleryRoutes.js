
const express = require('express');
const router = express.Router();
const { photoget, photoupload, photodelete, videoget,videoupload,videodelete } = require('../Controllers/GalleryController');
const  upload  = require('../Config/multer.js');

const isLoggedin = require('../Middleware/isLoggedin');

router.get('/photoget', photoget);
router.post('/photoupload',isLoggedin,upload.single('file'), photoupload);
router.delete('/photodelete',isLoggedin, photodelete);
router.get('/videoget', videoget);
router.get('/videouplaod',isLoggedin,upload.single('file'),videoupload)
router.get('/videodelete',isLoggedin,videodelete)

module.exports = router


