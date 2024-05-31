const api = require('./apiController');
const auth = require('./authController');

exports.showDashboard = async function (req, res) {
    const profileData = await api.getProfileData(req.session.user.email);
    const error = req.flash('error');
    const success = req.flash('success');
    res.render('dashboard', {
        profile: profileData,
        error: error.length > 0 ? error[0] : null,
        success: success.length > 0 ? success[0] : null,
    });
};

exports.logout = function (req, res) {
    req.session.destroy();
    res.redirect('/auth/login');
};

exports.showMyLists = function (req, res) {
    res.render('mylists', {
        user: req.session.user,
    });
};

exports.makeNewList = function (req, res) {
    res.render('newlist', {
        user: req.session.user,
    });
};

exports.showStoreBuilder = function (req, res) {
    res.render('store-builder');
}