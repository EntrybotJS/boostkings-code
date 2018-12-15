var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var AdminSettings = Models["AdminSettings"];

router.get(
  "/",

  function(req, res, next) {
    AdminSettings.getSettings(function(err, adminSettings) {
      if (err) console.log(err);

      if (!adminSettings) {
        req.flash("error", "There was an error while fetching settings from database.");
        res.locals.messages = req.flash();
      }

      res.locals.transparentBar = false;
      res.locals.pageTitle = "Admin settings";
      res.locals.navId = "admin-settings";
      res.locals.adminSettings = adminSettings;
      return res.render("pages/admin/settings");
    });
  }
);

router.post(
  "/",

  function(req, res, next) {
    AdminSettings.getSettings(function(err, settings) {
      if (!err) {
        if (!settings) {
          settings = new AdminSettings();
        }

        for (setting in req.body) {
          settings[setting] = req.body[setting];
        }
        settings.save(function(err) {
          if (!err) {
            req.flash("success", "Settings saved successfully.");
          } else {
            req.flash("error", "There was an error while saving settings.");
          }
          return res.redirect(req.get("referer"));
        });
      } else {
        req.flash("error", "Could not fetch current settings from database.");
        return res.redirect(req.get("referer"));
      }
    });
  }
);

module.exports = router;
