var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Terms of Use";
  res.locals.navId = "terms";
  res.render("pages/terms");
});

module.exports = router;
