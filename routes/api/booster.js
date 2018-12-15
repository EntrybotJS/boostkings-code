var express = require("express");
var router = express.Router();

var pug = require("pug");
var moment = require("moment");

var Models = require("../../models/schemas");
var User = Models["User"];
var Chat = Models["Chat"];
var Order = Models["Order"];

router.get(
  "/:userId/orders",

  function(req, res, next) {
    if (req.params.userId.toString() != req.user._id.toString()) {
      return {};
    }
    req.orders = {};
    return next();
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, todoOrders) {
        if (err || !todoOrders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.todoHtml = pug.renderFile("views/includes/boosterOrderPanel.pug", {
          orders: todoOrders,
          moment: moment,
        });
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: true, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, completedOrders) {
        if (err || !completedOrders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.doneHtml = pug.renderFile("views/includes/boosterOrderPanel.pug", {
          orders: completedOrders,
          moment: moment,
        });
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: false, requiresApproval: true })
      .populate("user")
      .exec(function(err, ordersAwaitingApproval) {
        if (err || !ordersAwaitingApproval) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.awaitingApprovalHtml = pug.renderFile("views/includes/boosterOrderPanel.pug", {
          orders: ordersAwaitingApproval,
          moment: moment,
        });
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ isInThePool: true, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, poolOrders) {
        if (err || !poolOrders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.poolHtml = pug.renderFile("views/includes/boosterOrderPanel.pug", {
          orders: poolOrders,
          moment: moment,
        });
        return next();
      });
  },

  function(req, res, next) {
    return res.json(req.orders);
  }
);

router.get(
  "/:userId/orders/count",

  function(req, res, next) {
    if (req.user && req.params.userId.toString() != req.user._id.toString()) {
      return {};
    }
    req.orders = {};
    return next();
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err || !orders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.todo = orders.length;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: true, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err || !orders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.done = orders.length;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ booster: req.params.userId, isDone: false, requiresApproval: true })
      .populate("user")
      .exec(function(err, orders) {
        if (err || !orders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.awaitingApproval = orders.length;
        return next();
      });
  },

  function(req, res, next) {
    Order.find({ isInThePool: true, isDone: false, requiresApproval: { $ne: true } })
      .populate("user")
      .exec(function(err, orders) {
        if (err || !orders) {
          console.log(err);
          return res.json({ error: "There was a problem while getting orders." });
        }
        req.orders.pool = orders.length;
        return next();
      });
  },

  function(req, res, next) {
    return res.json(req.orders);
  }
);

module.exports = router;
