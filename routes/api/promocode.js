var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var AdminSettings = Models["AdminSettings"];
var Promocode = Models["Promocode"];

router.post(
  "/",

  function checkHasPromocode(req, res, next) {
    if (req.body.promocode && req.body.promocode.trim() == "") {
      res.status(400).json({ error: "Please type in a promo code." });
    } else {
      return next();
    }
  },

  function(req, res, next) {
    AdminSettings.getSettings(function(err, adminSettings) {
      if (err) console.log(err);

      if (!adminSettings) {
        res.status(500).json({ error: "There was an error while applying the promocode." });
      }

      res.locals.adminSettings = adminSettings;
      return next();
    });
  },

  function(req, res, next) {
    Promocode.find()
      .lean()
      .exec(function(err, promocodes) {
        if (err) console.log(err);

        if (!promocodes) {
          res.status(500).json({ error: "There was an error while applying the promocode." });
        }

        res.locals.promocodes = promocodes;
        return next();
      });
  },

  function(req, res, next) {
    var exitModalPromocode = {
      code: ("BK" + res.locals.adminSettings.exitRebatePercentage + "OFF").toLowerCase().trim(),
      value: res.locals.adminSettings.exitRebatePercentage,
      type: "percentage",
    };

    res.locals.promocodes.push(exitModalPromocode);

    var foundPromocode = false;

    res.locals.promocodes.forEach(function(promocode) {
      if (req.body.promocode.trim().toLowerCase() == promocode.code.trim().toLowerCase()) {
        var successJson = {
          success: "Promotional code applied.",
          value: promocode.value,
          type: promocode.type,
        };
        res.status(200).json(successJson);
        foundPromocode = true;
        return false;
      }
    });

    if (!foundPromocode) {
      return res.status(401).json({ error: "Invalid promotional code." });
    }
  }
);

module.exports = router;
