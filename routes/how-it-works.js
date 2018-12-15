var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "How it works";
  res.locals.navId = "how-it-works";
  res.render("pages/how-it-works");
});

module.exports = router;
