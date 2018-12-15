var express = require("express");
var router = express.Router();

var Models = require("../../models/schemas");
var Chat = Models["Chat"];
var User = Models["User"];
var Order = Models["Order"];

router.get("/", function(req, res) {
  Chat.find({ order: req.query.order }).exec(function(err, msgs) {
    res.json(msgs);
  });
});

module.exports = router;
