var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Order = Models["Order"];

router.get(
  "/",

  function(req, res, next) {
    if (!req.user) {
      res.logout();
      req.flash("error", "Please login to access this page.");
      return res.redirect("/login");
    } else {
      return next();
    }
  },

  function(req, res, next) {
    Order.findOne({ _id: req.query.orderId, user: req.user._id }).exec(function(err, order) {
      if (err || !order) {
        req.flash("error", "There was a problem while getting the order details.");
        return res.redirect("/orders");
      } else {
        res.locals.transparentBar = false;
        res.locals.pageTitle = "Send credentials";
        res.locals.navId = "user-sendinfo";
        res.locals.order = order;
        return res.render("pages/user/sendinfo");
      }
    });
  }
);

module.exports = router;
