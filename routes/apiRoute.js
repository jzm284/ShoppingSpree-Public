const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/profile-data', apiController.getProfileData);
router.delete('/delete-account', apiController.deleteAccount); 

module.exports = router;