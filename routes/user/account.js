var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");

var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");

var htmlToText = require("nodemailer-html-to-text").htmlToText;
var pug = require("pug");

router.get(
  "/",

  function(req, res, next) {
    res.locals.transparentBar = false;
    res.locals.navId = "account";
    res.locals.pageTitle = "My Account";
    return res.render("pages/user/account");
  }
);

router.post(
  "/updateEmailAddress",

  function(req, res, next) {
    if (!req.user) {
      return res.redirect("/");
    } else {
      return next();
    }
  },

  function(req, res, next) {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash("error", "You cannot use this email address. Please type in a different email address.");
        return res.redirect(req.get("referer"));
      } else {
        return next();
      }
    });
  },

  function(req, res, next) {
    async.waterfall(
      [
        function getUser(done) {
          User.findOne({ _id: req.user._id }, function(err, user) {
            if (err) {
              return done(err);
            } else if (!user) {
              return done("There was a problem while updating your account.");
            }

            done(null, user);
          });
        },
        function(user, done) {
          crypto.randomBytes(50, function(err, buf) {
            var token = buf.toString("hex");
            done(err, token, user);
          });
        },
        function(token, user, done) {
          user.changeEmailToken = token;
          user.emailToChange = req.body.email;

          user.save(function(err) {
            done(err, token, user);
          });
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "boostkingsverify@gmail.com",
              pass: process.env.BK_EMAIL_PASSWORD,
            },
          });
          smtpTransport.use("compile", htmlToText());

          var subject = "Boost Kings - Email address change";

          var mailOptions = {
            to: req.body.email,
            from: "Boost Kings <weareboostkings@gmail.com>",
            subject: subject,
            replyTo: "boostkings@outlook.com",
            html: pug.renderFile("views/emails/template.pug", {
              subject: subject,
              cta: {
                url: process.env.HOST + "/emailchange/" + token,
                message: "Confirm change",
              },
              paragraphs: [
                "Hi there,",
                "You are receiving this because you (or someone else) have requested to change the email address for your account.",
                "Please click on the following button to confirm the change:",
              ],
            }),
          };

          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash("info", "An email has been sent to " + req.body.email + " with further instructions.");
            done(err, "done");
          });
        },
      ],
      function(err) {
        if (err) return next(err);
        res.redirect("/emailchange");
      }
    );
  }
);

module.exports = router;
