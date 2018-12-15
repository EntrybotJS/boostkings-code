var express = require("express");
var router = express.Router();

var nodemailer = require("nodemailer");
var htmlToText = require("nodemailer-html-to-text").htmlToText;
var pug = require("pug");

var Models = require("../../models/schemas");
var Order = Models["Order"];
var User = Models["User"];
var Chat = Models["Chat"];
var AdminSettings = Models["AdminSettings"];

router.get(
  "/",

  function(req, res, next) {
    AdminSettings.getSettings(function(err, adminSettings) {
      if (err) console.log(err);

      if (!adminSettings) {
        req.flash("error", "There was an error while loading the order.");
        return res.redirect(req.get("referer"));
      }

      res.locals.adminSettings = adminSettings;
      return next();
    });
  },

  function(req, res, next) {
    Order.find({ booster: req.user, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err) {
          console.log(err);
          req.flash("error", "There was a problem while getting orders. Please contact the admin.");
          return res.redirect("/contact");
        }
        res.locals.boosterOrders = orders;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.user, isDone: true, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err) {
          console.log(err);
          req.flash("error", "There was a problem while getting orders. Please contact the admin.");
          return res.redirect("/contact");
        }
        res.locals.completedBoosterOrders = orders;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.user, isDone: false, requiresApproval: true })
      .populate("user")
      .exec(function(err, orders) {
        if (err) {
          console.log(err);
          req.flash("error", "There was a problem while getting orders. Please contact the admin.");
          return res.redirect("/contact");
        }
        res.locals.ordersAwaitingApproval = orders;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ isInThePool: true, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err) {
          console.log(err);
          req.flash("error", "There was a problem while getting orders. Please contact the admin.");
          return res.redirect("/contact");
        }
        res.locals.transparentBar = false;
        res.locals.pageTitle = "My current orders";
        res.locals.navId = "booster-orders";
        res.locals.poolOrders = orders;
        return res.render("pages/booster/orders/list");
      });
  }
);

router.get(
  "/view/:orderId",

  function(req, res, next) {
    Order.findOne({ _id: req.params.orderId })
      .populate("user")
      .populate("booster")
      .exec(function(err, order) {
        if (
          order.isInThePool ||
          (order && order.booster && req.user && order.booster._id.toString() == req.user._id.toString())
        ) {
          return next();
        } else {
          req.logout();
          req.flash("error", "Please login to access this page.");
          return res.redirect("/login");
        }
      });
  },

  function(req, res, next) {
    User.getBoosters(function(err, boosters) {
      res.locals.boosters = boosters;

      Order.findOne({ _id: req.params.orderId })
        .populate("user")
        .exec(function(err, order) {
          res.locals.transparentBar = false;
          res.locals.pageTitle = "Order";
          if (order.isInThePool) {
            res.locals.navId = "booster-orders-pool";
          } else {
            res.locals.navId = "booster-orders";
          }
          res.locals.order = order;

          Chat.find({ order: req.params.orderId })
            .sort("created_on")
            .populate("user")
            .exec(function(err, messages) {
              if (err) {
                console.log(err);
              }
              res.locals.previousMessages = messages;
              return res.render("pages/booster/orders/view");
            });
        });
    });
  }
);

router.post(
  "/view/:orderId",

  function(req, res, next) {
    Order.findOne({ _id: req.params.orderId })
      .populate("user")
      .populate("booster")
      .exec(function(err, order) {
        if (
          order.isInThePool ||
          (order && order.booster && req.user && order.booster._id.toString() == req.user._id.toString())
        ) {
          return next();
        } else {
          req.logout();
          req.flash("error", "Please login to access this page.");
          return res.redirect("/login");
        }
      });
  },

  function(req, res, next) {
    if (req.body.action == "sendVerification") {
      Order.findOneAndUpdate(
        { _id: req.params.orderId },
        { $set: { isInThePool: false, requiresApproval: true } },
        { new: true }
      )
        .populate("user")
        .exec(function(err, updatedOrder) {
          if (err) {
            console.log(err);
            req.flash("error", "There was an error while updating the order.");
            return res.redirect(req.get("referer"));
          } else {
            req.flash("success", "Order successfully sent to admins for verification.");
            return res.redirect("/booster/orders");
          }
        });
    } else if (req.body.action == "assign") {
      Order.findOneAndUpdate(
        { _id: req.params.orderId },
        { $set: { isInThePool: false, booster: req.body.booster } },
        { new: true }
      )
        .populate("user")
        .exec(function(err, updatedOrder) {
          if (err) {
            console.log(err);
            req.flash("error", "There was an error while updating the order.");
            return res.redirect(req.get("referer"));
          } else {
            req.flash("success", "Boost assigned successfully.");
            return res.redirect(req.get("referer"));
          }
        });
    } else if (req.body.action == "pool") {
      Order.findOneAndUpdate({ _id: req.params.orderId }, { $set: { isInThePool: true, booster: null } }, { new: true })
        .populate("user")
        .exec(function(err, updatedOrder) {
          if (err) {
            console.log(err);
            req.flash("error", "There was an error while updating the order.");
            return res.redirect(req.get("referer"));
          } else {
            req.flash("success", "Boost assigned successfully.");
            return res.redirect(req.get("referer"));
          }
        });
    }
  }
);

module.exports = router;
