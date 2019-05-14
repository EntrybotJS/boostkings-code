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
        var smtpTransport = nodemailer.createTransport({
          host: process.env.BK_EMAIL_SERVICE,
          port: process.env.BK_EMAIL_PORT,
          auth: {
<<<<<<< HEAD
<<<<<<< HEAD
            user: process.env.BK_EMAIL_USERNAME,
            pass: process.env.BK_EMAIL_PASSWORD
=======
=======
>>>>>>> c8d791dd84e88e8e57ca827a9f2335d7c02b59e3
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

        var subject = "Boost Kings - Password reset request";

        var mailOptions = {
          to: user.email,
<<<<<<< HEAD
<<<<<<< HEAD
          from: `Boost Kings <${process.env.BK_EMAIL_ADDRESS}>`,
=======
          from: `Boost Kings <${process.env.BK_EMAIL}>`,
>>>>>>> c8d791dd84e88e8e57ca827a9f2335d7c02b59e3
=======
          from: `Boost Kings <${process.env.BK_EMAIL}>`,
>>>>>>> c8d791dd84e88e8e57ca827a9f2335d7c02b59e3
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
          }),
        };

        smtpTransport.sendMail(mailOptions, function(err) {
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
