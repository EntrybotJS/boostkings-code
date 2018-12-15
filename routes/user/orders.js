var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Order = Models["Order"];
var Chat = Models["Chat"];

router.get(
  "/",

  function(req, res, next) {
    Order.find({ user: req.user })
      .populate("user")
      .exec(function(err, orders) {
        res.locals.transparentBar = false;
        res.locals.pageTitle = "My Orders";
        res.locals.navId = "user-orders";
        res.locals.orders = orders.sort(function(a, b) {
          return b.created_on - a.created_on;
        });

        if (req.query.orderSuccess) {
          req.flash("success", "Boost order successfully completed. You should see it in the list below.");
          res.locals.messages = req.flash();
        }
        return res.render("pages/user/orders");
      });
  }
);

router.get(
  "/:orderId",

  function(req, res, next) {
    Order.findOne({ _id: req.params.orderId })
      .populate("user")
      .exec(function(err, order) {
        if (order && order.user && order.user._id.toString() == req.user._id.toString()) {
          return next();
        } else {
          console.log(
            "user " + req.user._id + " tried to access order " + order._id + ", which has user " + order.user._id
          );
          req.logOut();
          req.flash("error", "Please log in to access this page.");
          return res.redirect("/login");
        }
      });
  },

  function(req, res, next) {
    Order.findOne({ _id: req.params.orderId })
      .populate("user")
      .exec(function(err, order) {
        res.locals.transparentBar = false;
        res.locals.pageTitle = "Order";
        res.locals.navId = "user-orders";
        res.locals.order = order;
        res.locals.preventChat = true;

        Chat.find({ order: req.params.orderId })
          .sort("created_on")
          .populate("user")
          .exec(function(err, messages) {
            if (err) {
              console.log(err);
            }
            res.locals.previousMessages = messages;
            return res.render("pages/user/orders/view");
          });
      });
  }
);

module.exports = router;
