var mongoose = require("mongoose");

// This represents a chat message database entry
// (live chat between booster and client)
var ChatSchema = mongoose.Schema({
  // Timestamp of when the message was sent
  created_on: {
    type: Date,
    default: Date.now,
  },
  // Message content
  message: {
    type: String,
    required: true,
  },
  // User that sent the message (can be the booster/admin or the client)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The boost order that the live chat session exists for
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
});

module.exports = ChatSchema;
