var Models = require("../models/schemas");
var Order = Models["Order"];

// This will redirect the user to the login page if they're not an admin
exports.requireAdminRole = function(req, res, next) {
  if (req.user && req.user.group == "admin") {
    next();
  } else {
    req.logOut();
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }
};

// This will redirect the user to the login page if they're not a booster or an admin
exports.requireBoosterRole = function(req, res, next) {
  if (req.user && (req.user.group == "booster" || req.user.group == "admin")) {
    return next();
  } else {
    req.logOut();
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }
};

// This will redirect the user to the login page if they're not a normal user
exports.requireUserRole = function(req, res, next) {
  if (req.user && req.user.group == "user") {
    next();
  } else {
    req.logOut();
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }
};

// This will redirect the user to the login page if they're not logged in
// (this middleware is used to restrict access to pages where the user needs to be logged in)
exports.requireLoggedInUser = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }
};
