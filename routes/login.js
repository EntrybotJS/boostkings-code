var express = require("express");
var router = express.Router();
var passport = require("passport");
var Models = require("../models/schemas");
var User = Models["User"];

var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");

var htmlToText = require("nodemailer-html-to-text").htmlToText;
var pug = require("pug");

router.get(
  "/",

  function(req, res, next) {
    if (req.user) {
      return res.redirect("/orders");
    } else {
      return next();
    }
  },

  function(req, res, next) {
    res.locals.transparentBar = false;
    res.locals.pageTitle = "Log In";
    res.locals.navId = "login";
    res.render("pages/login");
  }
);

router.post(
  "/",

  function(req, res, next) {
    if (req.user) {
      return res.redirect("/");
    } else {
      return next();
    }
  },

  function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
      if (user && !user.verifiedEmail) {
        async.waterfall(
          [
            function(done) {
              crypto.randomBytes(50, function(err, buf) {
                var token = buf.toString("hex");
                done(err, token);
              });
            },
            function(token, done) {
              User.findOne({ email: user.email }, function(err, user) {
                if (!user) {
                  req.flash("error", "No account with that email address exists.");
                  return res.redirect("/signup");
                }

                user.verifyEmailToken = token;

                user.save(function(err) {
                  done(err, token, user);
                });
              });
            },
            function(token, user, done) {
              var smtpTransport = nodemailer.createTransport({
                host: process.env.BK_EMAIL_SERVICE,
                port: process.env.BK_EMAIL_PORT,
                auth: {
<<<<<<< HEAD
                  user: process.env.BK_EMAIL_USERNAME,
                  pass: process.env.BK_EMAIL_PASSWORD
=======
                  user: process.env.BK_EMAIL,
                  pass: process.env.BK_EMAIL_PASSWORD,
>>>>>>> c8d791dd84e88e8e57ca827a9f2335d7c02b59e3
                },
                tls: {
                  // do not fail on invalid certs
                  rejectUnauthorized: false
                }
              });
              smtpTransport.use("compile", htmlToText());

              var subject = "Boost Kings - Verify your email address";

              var mailOptions = {
                to: user.email,
<<<<<<< HEAD
                from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
=======
                from: `Boost Kings <${process.env.BK_EMAIL}>`,
>>>>>>> c8d791dd84e88e8e57ca827a9f2335d7c02b59e3
                subject: subject,
                replyTo: "boostkings@outlook.com",
                html: pug.renderFile("views/emails/template.pug", {
                  subject: subject,
                  cta: {
                    url: process.env.HOST + "/verify/" + token,
                    message: "Verify my email address",
                  },
                  paragraphs: [
                    "Hi there,",
                    "You are receiving this because you (or someone else) have requested to verify the email address for your account.",
                    "Please click on the following button to complete the signup process:",
                  ],
                }),
              };

              smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("info", "An email has been sent to " + user.email + " with further instructions.");
                done(err, "done");
              });
            },
          ],
          function(err) {
            if (err) return next(err);
            return res.redirect("/verify");
          }
        );
      } else if (err || !user) {
        if (info.message == "Missing credentials") {
          info.message = "Please fill in all fields to log in.";
        }
        req.flash("error", info.message);
        return res.redirect("/login");
      } else {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          if (user.isAdmin()) {
            return res.redirect("/admin");
          }
          if (user.isBooster()) {
            return res.redirect("/");
          } else {
            return res.redirect("/orders");
          }
        });
      }
    })(req, res, next);
  }
);

module.exports = router;
