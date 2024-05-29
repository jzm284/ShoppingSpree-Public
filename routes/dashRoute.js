const express = require('express');
const router = express.Router();

const dashController = require('../controllers/dashController');

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

router.get('/dashboard', checkAuth, dashController.showDashboard);
router.get('/logout', dashController.logout);
router.get('/mylists', checkAuth, dashController.showMyLists);
router.get('/profile', checkAuth, dashController.showProfile);
router.get('/newlist', checkAuth, dashController.makeNewList);

module.exports = router;