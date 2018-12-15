var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var User = Models["User"];

router.get("/", function(req, res, next) {
  res.locals.navId = "admin-index";
  res.redirect("/admin/orders");
});

module.exports = router;
