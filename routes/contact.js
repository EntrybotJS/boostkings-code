var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Contact us";
  res.locals.navId = "contact";
  res.render("pages/contact");
});

module.exports = router;
