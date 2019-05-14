var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");

var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");

var htmlToText = require("nodemailer-html-to-text").htmlToText;
var pug = require("pug");

router.get("/:token", function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(
    err,
    user
  ) {
    if (!user) {
      req.flash(
        "error",
        "Password reset token is invalid or has expired. Request a new one by entering your email address below."
      );
      return res.redirect("/forgot");
    }
    res.locals.transparentBar = false;
    res.locals.pageTitle = "Password Reset";
    res.locals.navId = "reset";
    res.render("pages/reset");
  });
});

router.post("/:token", function(req, res) {
  async.waterfall(
    [
      function(done) {
        if (req.body.password != req.body.confirm) {
          req.flash("error", "The password fields do not match. Please try again.");
          return res.redirect(req.get("referer"));
        } else {
          done();
        }
      },

      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(
          err,
          user
        ) {
          if (!user) {
            req.flash(
              "error",
              "Password reset token is invalid or has expired. Request a new one by entering your email address below."
            );
            return res.redirect("/forgot");
          }

          if (user.validPassword(req.body.password)) {
            req.flash("error", "You cannot use your current password. Please choose a new one.");
            return res.redirect(req.get("referer"));
          } else {
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              done(err, user);
            });
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: process.env.BK_EMAIL_SERVICE,
          port: process.env.BK_EMAIL_PORT,
          auth: {
            user: process.env.BK_EMAIL_USERNAME,
            pass: process.env.BK_EMAIL_PASSWORD
          },
          tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
          }
        });

        smtpTransport.use("compile", htmlToText());

        var subject = "Boost Kings - Your password has been changed";

        var mailOptions = {
          to: user.email,
          from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
          subject: subject,
          replyTo: "boostkings@outlook.com",
          html: pug.renderFile("views/emails/template.pug", {
            subject: subject,
            cta: {
              url: process.env.HOST + "/forgot",
              message: "Reset my password",
            },
            paragraphs: [
              "Hi there,",
              "The password for your Boost Kings account has just been changed.",
              "If you think someone else has changed your password, reset it by clicking the button below.",
            ],
          }),
        };

        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function(err) {
      if (err) {
        if (err.name == "ValidationError") {
          for (field in err.errors) {
            req.flash("error", err.errors[field].message);
          }
        } else {
          req.flash("error", "There was a problem while resetting your password. Please try again.");
        }
        return res.redirect(req.get("referer"));
      } else {
        req.logOut();
        return res.redirect("/login");
      }
    }
  );
});

module.exports = router;
