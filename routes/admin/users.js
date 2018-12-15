var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var User = Models["User"];

router.get(
  "/",

  function(req, res, next) {
    User.getUsers(function(err, users) {
      res.locals.transparentBar = false;
      res.locals.pageTitle = "All Users";
      res.locals.navId = "admin-users";
      res.locals.users = users;
      return res.render("pages/admin/users");
    });
  }
);

module.exports = router;
