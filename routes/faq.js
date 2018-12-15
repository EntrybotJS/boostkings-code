var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Frequently Asked Questions";
  res.locals.navId = "faq";
  res.render("pages/faq");
});

module.exports = router;
