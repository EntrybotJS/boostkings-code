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

router.get("/", function(req, res, next) {
  res.locals.transparentBar = false;
  res.locals.pageTitle = "Email address change";
  res.locals.navId = "index";
  res.render("pages/emailchange");
});

router.get(
  "/:token",

  function(req, res) {
    User.findOne({ changeEmailToken: req.params.token }, function(err, user) {
      if (!user) {
        req.flash("error", "There was a problem while verifying your identity. Please try again.");
        return res.redirect("/account");
      } else {
        User.findOne({ email: user.emailToChange }, function(err, existingEmailUser) {
          if (existingEmailUser) {
            req.flash("error", "You cannot use this email address. Please type in a different email address.");
            return res.redirect("/account");
          } else {
            async.waterfall(
              [
                function(done) {
                  user.email = user.emailToChange;
                  user.emailToChange = undefined;

                  user.changeEmailToken = undefined;
                  user.verifiedEmail = true;

                  user.save(function(err) {
                    if (err) {
                      return done(err);
                    }

                    req.login(user, function(err2) {
                      return done(err2, user);
                    });
                  });
                },
                function(user, done) {
                  var mailgun = require('mailgun-js')({apiKey: process.env.BK_EMAIL_API, domain: process.env.BK_EMAIL_URL});

                  var subject = "Email address updated";

                  var mailOptions = {
                    to: user.email,
                    from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
                    subject: subject,
                    replyTo: "boostkings@outlook.com",
                    text: htmlToText.fromString(pug.renderFile("views/emails/template.pug", {
                      subject: subject,
                      paragraphs: [
                        "Hi there,",
                        'You (or someone else) changed the email address for your account. If you did change your email address, great. If however you think this shouldn\'t be, please <a href="https://boostkings.lol/contact">contact us</a>.',
                        "Have fun!",
                      ],
                    }))
                  };

                  mailgun.messages().send(mailOptions, function(err, body) {
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
                    req.flash("error", "There was a problem while updating your account. Try again.");
                    console.log(err);
                  }
                  return res.redirect("/account");
                } else {
                  req.flash("success", "Account successfully updated.");
                  res.redirect("/account");
                }
              }
            );
          }
        });
      }
    });
  }
);

module.exports = router;
