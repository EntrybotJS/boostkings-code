var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Price = Models["Price"];

router.get(
  "/",

  function(req, res, next) {
    Price.getPrices(function(err, prices) {
      if (err) console.log(err);

      if (!prices) {
        req.flash("error", "There was an error while fetching current prices from database.");
        res.locals.messages = req.flash();
      }

      res.locals.transparentBar = false;
      res.locals.pageTitle = "Change prices";
      res.locals.navId = "admin-settings";
      res.locals.prices = prices;
      return res.render("pages/admin/prices");
    });
  }
);

router.post(
  "/",

  function(req, res, next) {
    Price.getPrices(function(err, prices) {
      if (!err) {
        if (!prices) {
          prices = new Price();
        }

        for (boostType in req.body) {
          for (division in req.body[boostType]) {
            obj = {};
            obj.name = Object.keys(req.body[boostType][division])[0];
            obj.regularPrice = parseFloat(req.body[boostType][division][Object.keys(req.body[boostType][division])[0]]);
            req.body[boostType][division] = obj;
          }

          prices[boostType] = req.body[boostType];
        }
        prices.save(function(err) {
          if (!err) {
            req.flash("success", "Prices saved successfully.");
          } else {
            req.flash("error", "There was an error while saving the new prices.");
          }
          return res.redirect(req.get("referer"));
        });
      } else {
        req.flash("error", "Could not fetch current prices from database.");
        return res.redirect(req.get("referer"));
      }
    });
  }
);

module.exports = router;
