var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var User = Models["User"];

router.get(
  "/",

  function(req, res, next) {
    User.getBoosters(function(err, boosters) {
      res.locals.transparentBar = false;
      res.locals.pageTitle = "All Boosters";
      res.locals.navId = "admin-boosters";
      res.locals.boosters = boosters;
      return res.render("pages/admin/boosters/list");
    });
  }
);

router.get(
  "/add",

  function(req, res, next) {
    User.getUsers(function(err, users) {
      res.locals.transparentBar = false;
      res.locals.pageTitle = "Add a booster";
      res.locals.navId = "admin-boosters";
      res.locals.users = users;
      return res.render("pages/admin/boosters/add");
    });
  }
);

router.post(
  "/add",

  function(req, res, next) {
    User.findOne({ _id: req.body.newBooster }).exec(function(err, user) {
      user.group = "booster";
      user.save(function(err) {
        if (!err) {
          req.flash("success", "User " + user.email + " is now a booster.");
          return res.redirect("/admin/boosters");
        } else {
          req.flash("error", "Could not make " + user.email + " a booster. Please try again.");
          return res.redirect(req.get("referer"));
        }
      });
    });
  }
);

router.get(
  "/:boosterId",

  function(req, res, next) {
    User.getBooster(req.params.boosterId, function(err, booster) {
      if (err) {
        req.flash("error", "There was an error while fetching booster details.");
        return res.redirect(req.get("referer"));
      }

      res.locals.transparentBar = false;
      res.locals.navId = "admin-boosters";
      res.locals.booster = booster;
      return res.render("pages/admin/boosters/view");
    });
  }
);

router.get(
  "/:boosterId/remove",

  function(req, res, next) {
    User.findOne({ _id: req.params.boosterId }).exec(function(err, booster) {
      res.locals.transparentBar = false;
      res.locals.pageTitle = "Remove a booster";
      res.locals.navId = "admin-boosters";
      res.locals.booster = booster;
      return res.render("pages/admin/boosters/remove");
    });
  }
);

router.post(
  "/:boosterId/remove",

  function(req, res, next) {
    User.findOne({ _id: req.params.boosterId }).exec(function(err, user) {
      user.group = "user";
      user.save(function(err) {
        if (!err) {
          req.flash("success", user.email + " is now a normal user.");
          return res.redirect("/admin/boosters");
        } else {
          req.flash("error", "Could not make " + user.email + " a normal user. Please try again.");
          return res.redirect(req.get("referer"));
        }
      });
    });
  }
);

module.exports = router;
