var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Chat = Models["Chat"];
var User = Models["User"];
var Order = Models["Order"];

router.get(
  "/:orderId",

  function(req, res, next) {
    req.orderInfo = {};
    return next();
  },

  function(req, res, next) {
    Order.findOne({ _id: req.params.orderId }).exec(function(err, order) {
      if (err || !order) {
        console.log(err || "");
        return res.json({ error: "There was a problem while getting order details." });
      }

      if (order.user.toString() != req.query.user.toString()) {
        console.log("API - User tried to fetch another user's order details.");
        return res.json({ error: "There was a problem while getting order details." });
      }

      req.orderInfo.hasBooster = order.booster ? true : false;

      return next();
    });
  },

  function(req, res, next) {
    return res.json(req.orderInfo);
  }
);

module.exports = router;
