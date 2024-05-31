const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
    if ((req.session && req.session.loggedIn) || process.env.NODE_ENV === "dev") {
      console.log("User is logged in");
  
      if (process.env.NODE_ENV === "dev") {
        console.log("RUNNING IN DEV MODE, CHANGE BEFORE PRODUCTION");
        req.session.user = {
          email: "test@test.com",
        };
      }
      next();
    } else {
      console.log("User is not logged in");
      res.redirect("/auth/login");
      console.log('did the thing');
    }
  }

router.get('/profile-data', checkAuth, apiController.getProfileData);
router.delete('/delete-account', checkAuth, apiController.deleteAccount); 
router.post('new-list', checkAuth, apiController.makeNewList);
router.get('/stores', checkAuth, apiController.getStores);

module.exports = router;