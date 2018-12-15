var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Promocode = Models["Promocode"];

router.get("/", function(req, res, next) {
  Promocode.find(function(err, promocodes) {
    res.locals.transparentBar = false;
    res.locals.navId = "admin-settings";
    res.locals.promocodes = promocodes;
    return res.render("pages/admin/promocodes/list");
  });
});

router.get("/new", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.navId = "admin-settings";
  return res.render("pages/admin/promocodes/new");
});

router.post("/new", function(req, res, next) {
  var promocode = new Promocode();
  promocode.code = req.body.code;
  promocode.value = req.body.value;
  promocode.type = req.body.unit;

  promocode.save(function(err, savedPromocode) {
    if (!err) {
      req.flash("success", "Promocode '" + promocode.code + "' saved successfully.");
      return res.redirect("/admin/promocodes");
    } else {
      req.flash("error", "Could not save promocode. Please try again.");
      return res.redirect(req.get("referer"));
    }
  });
});

router.get("/:promocodeId", function(req, res, next) {
  Promocode.findOne({ _id: req.params.promocodeId }, function(err, promocode) {
    if (err) {
      req.flash("error", "There was an error while fetching promocode details.");
      return res.redirect(req.get("referer"));
    }
    res.locals.transparentBar = false;
    res.locals.navId = "admin-settings";
    res.locals.promocode = promocode;
    return res.render("pages/admin/promocodes/edit");
  });
});

router.post("/:promocodeId", function(req, res, next) {
  Promocode.findOne({ _id: req.params.promocodeId }).exec(function(err, promocode) {
    promocode.code = req.body.code;
    promocode.value = req.body.value;
    promocode.type = req.body.unit;

    promocode.save(function(err) {
      if (!err) {
        req.flash("success", "Promocode '" + promocode.code + "' updated successfully.");
        return res.redirect("/admin/promocodes");
      } else {
        req.flash("error", "Could not save promocode. Please try again.");
        return res.redirect(req.get("referer"));
      }
    });
  });
});

router.get("/:promocodeId/remove", function(req, res, next) {
  Promocode.findOne({ _id: req.params.promocodeId }).exec(function(err, promocode) {
    res.locals.transparentBar = false;
    res.locals.navId = "admin-settings";
    res.locals.promocode = promocode;
    return res.render("pages/admin/promocodes/remove");
  });
});

router.post("/:promocodeId/remove", function(req, res, next) {
  Promocode.findOneAndRemove({ _id: req.params.promocodeId }, function(err, promocode) {
    if (!err) {
      req.flash("success", "Promocode '" + promocode.code + "' deleted successfully.");
      return res.redirect("/admin/promocodes");
    } else {
      req.flash("error", "Could not delete promocode. Please try again.");
      return res.redirect(req.get("referer"));
    }
  });
});

module.exports = router;
