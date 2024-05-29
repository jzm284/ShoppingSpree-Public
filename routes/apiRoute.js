const express = require('express');
const router = express.Router();
const authController = require('../controllers/apiController');

router.get('/profile-data', authController.getProfileData);

module.exports = router;