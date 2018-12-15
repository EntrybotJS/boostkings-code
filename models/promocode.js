var mongoose = require("mongoose");

// Represents a promocode
var PromocodeSchema = mongoose.Schema({
  created_on: {
    type: Date,
    default: Date.now,
  },
  // The promocode itself
  code: {
    type: String,
    required: true,
  },
  // The value of the promocode
  // (ex: 15, 25.50)
  value: {
    type: Number,
    required: true,
  },
  // The type of the promocode
  type: {
    type: String,
    enum: ["percentage", "amount"],
    required: true,
  },
});

module.exports = PromocodeSchema;
