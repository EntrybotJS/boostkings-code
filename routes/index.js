var express = require("express");
var router = express.Router();

var Models = require("../models/schemas");
var User = Models["User"];

router.get("/", function(req, res, next) {
  if (req.user && req.user.group == "admin") {
    return res.redirect("/admin");
  } else if (req.user && req.user.group == "booster") {
    return res.redirect("/booster");
  } else if (req.user && req.user.group == "user") {
    res.locals.transparentBar = true;
    res.locals.navId = "index";
    return res.render("pages/index");
  } else {
    User.find(function(err, users) {
      if (users) {
        res.locals.playersCount = users.length;
      }
      res.locals.transparentBar = true;
      res.locals.navId = "index";
      return res.render("pages/index");
    });
  }
});

module.exports = router;
