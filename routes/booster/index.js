var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var User = Models["User"];

router.get("/", function(req, res, next) {
  res.locals.navId = "booster-index";
  res.redirect("/booster/orders");
});

module.exports = router;
