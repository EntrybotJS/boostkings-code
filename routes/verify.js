var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");

var htmlToText = require("nodemailer-html-to-text").htmlToText;
var pug = require("pug");

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Email verification";
  res.locals.navId = "index";
  res.render("pages/verify");
});

router.get("/:token", function(req, res) {
  User.findOne({ verifyEmailToken: req.params.token }, function(err, user) {
    if (!user) {
      req.flash("error", "Account verification token is invalid. Request a new one by logging in.");
      return res.redirect("/login");
    } else {
      async.waterfall(
        [
          function(done) {
            user.verifyEmailToken = undefined;
            user.verifiedEmail = true;

            user.save(function(err) {
              req.login(user, function(err) {
                done(err, user);
              });
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

            var subject = "Welcome to Boost Kings!";

            var mailOptions = {
              to: user.email,
              from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
              subject: subject,
              replyTo: "boostkings@outlook.com",
              html: pug.renderFile("views/emails/template.pug", {
                subject: subject,
                cta: {
                  url: process.env.HOST + "/prices",
                  message: "Purchase a boost",
                },
                paragraphs: [
                  "Hi there,",
                  "Thanks for signing up for Boost Kings. Your email address is now confirmed. Have fun!",
                ],
              }),
            };

            smtpTransport.sendMail(mailOptions, function(err) {
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
              req.flash("error", "There was a problem while verifying your account. Try logging in.");
            }
            return res.redirect("/login");
          } else {
            req.flash("success", "Account successfully verified. Welcome!");
            res.redirect("/prices");
          }
        }
      );
    }
  });
});

module.exports = router;
