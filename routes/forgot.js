var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");

var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var mg = require('nodemailer-mailgun-transport');

var htmlToText = require("html-to-text");
var pug = require("pug");

router.get(
  "/",

  function(req, res, next) {
    req.logOut();
    next();
  },

  function(req, res, next) {
    res.locals.transparentBar = false;
    res.locals.pageTitle = "Forgot my password";
    res.locals.navId = "forgot";
    return res.render("pages/forgot");
  }
);

router.post("/", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(50, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var mailgun = require('mailgun-js')({apiKey: process.env.BK_EMAIL_API, domain: process.env.BK_EMAIL_URL});

        var subject = "Boost Kings - Password reset request";

        var mailOptions = {
          to: user.email,
          from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
          subject: subject,
          replyTo: "boostkings@outlook.com",
          html: pug.renderFile("views/emails/template.pug", {
            subject: subject,
            cta: {
              url: process.env.HOST + "/reset/" + token,
              message: "Reset my password",
            },
            paragraphs: [
              "Hi there,",
              "You are receiving this because you (or someone else) have requested the reset of the password for your account.",
              "Please click on the following button to complete the process:",
            ],
          })
        };

        mailgun.messages().send(mailOptions, function(err, body) {
          console.log(body)
          req.flash("info", "An e-mail has been sent to " + user.email + " with further instructions.");
          done(err, "done");
        });
      },
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

module.exports = router;
