const express = require("express");
const router = express.Router();

const dashController = require("../controllers/dashController");

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
  if ((req.session && req.session.loggedIn) || process.env.NODE_ENV === "dev") {
    console.log("User is logged in");

    if (process.env.NODE_ENV === "dev") {
      console.log("RUNNING IN DEV MODE, CHANGE BEFORE PRODUCTION");
      req.session.user = {
        email: "owner@test.com",
      };
    }
    next();
  } else {
    console.log("User is not logged in");
    res.redirect("/auth/login");
  }
}

router.get("/", checkAuth, dashController.showDashboard);
router.get("/mylists", checkAuth, dashController.showMyLists);
router.get("/newlist", checkAuth, dashController.makeNewList);
router.get("/store-builder", checkAuth, dashController.showStoreBuilder);

module.exports = router;
