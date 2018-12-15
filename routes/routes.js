var middleware = require("./middleware");

module.exports = function(app, io) {
  // public routes
  app.use("/", require("./index"));
  app.use("/how-it-works", require("./how-it-works"));
  app.use("/prices", require("./prices"));
  app.use("/faq", require("./faq"));
  app.use("/contact", require("./contact"));
  app.use("/signup", require("./signup"));
  app.use("/login", require("./login"));
  app.use("/forgot", require("./forgot"));
  app.use("/reset", require("./reset"));
  app.use("/verify", require("./verify"));
  app.use("/terms", require("./terms"));
  app.use("/privacy", require("./privacy"));

  // user routes
  app.use("/orders", middleware.requireUserRole, require("./user/orders"));
  app.use("/sendinfo", middleware.requireUserRole, require("./user/sendinfo"));
  app.use("/account", middleware.requireLoggedInUser, require("./user/account"));
  app.use("/emailchange", middleware.requireLoggedInUser, require("./emailchange"));

  // admin routes
  app.use("/admin", middleware.requireAdminRole, require("./admin/index"));
  app.use("/admin/users", middleware.requireAdminRole, require("./admin/users"));
  app.use("/admin/boosters", middleware.requireAdminRole, require("./admin/boosters"));
  app.use("/admin/orders", middleware.requireAdminRole, require("./admin/orders"));
  app.use("/admin/prices", middleware.requireAdminRole, require("./admin/prices"));
  app.use("/admin/promocodes", middleware.requireAdminRole, require("./admin/promocodes"));
  app.use("/admin/settings", middleware.requireAdminRole, require("./admin/settings"));

  // booster routes
  app.use("/booster", middleware.requireBoosterRole, require("./booster/index"));
  app.use("/booster/orders", middleware.requireBoosterRole, require("./booster/orders"));

  // other routes
  app.get("/logout", function(req, res, next) {
    req.logOut();
    return res.redirect("/");
  });

  // api routes
  app.use("/api/paypal", require("./api/paypal"));
  app.use("/api/chat", require("./api/chat"));
  app.use("/api/user", require("./api/user"));
  app.use("/api/booster", require("./api/booster"));
  app.use("/api/order", require("./api/order"));
  app.use("/api/promocode", require("./api/promocode"));
};
