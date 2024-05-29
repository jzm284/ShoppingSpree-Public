const api = require('./apiController');

exports.showDashboard = async function (req, res) {
    //make an api call to get the user data
    const profileData = await api.getProfileData(req.session.user.email);
    res.render('dashboard', {
        profile: profileData,
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