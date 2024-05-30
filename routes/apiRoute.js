const express = require('express');
const router = express.Router();
const authController = require('../controllers/apiController');

router.get('/profile-data', authController.getProfileData);
router.delete('/delete-account', authController.deleteAccount); 

module.exports = router;