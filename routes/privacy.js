var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Privacy Policy";
  res.locals.navId = "privacy";
  res.render("pages/privacy");
});

module.exports = router;
