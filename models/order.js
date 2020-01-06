var mongoose = require("mongoose");
var crypto = require("crypto");

// functions used to encrypt/decrypt sensitive database fields
function encrypt(text) {
  var cipher = crypto.createCipher("aes-256-cbc", process.env.MONGOOSE_ENCRYPTION_KEY);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text) {
  if (text === null || typeof text === "undefined") {
    return text;
  }
  var decipher = crypto.createDecipher("aes-256-cbc", process.env.MONGOOSE_ENCRYPTION_KEY);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// Represents a boost order
var OrderSchema = mongoose.Schema({
  // The client that purchased the boost
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The booster that will handle the boosting
  booster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // The PayPal payment ID of the order
  paypalPaymentID: {
    type: String,
    required: true,
  },
  // The PayPal ID of the client who purchased the boost
  paypalPayerID: {
    type: String,
    required: true,
  },
  // The human-readable name of the order
  // (ex: "Duo Games - 3 games")
  name: {
    type: String,
    required: true,
  },
  // The price of the order (paid by the client)
  // (ex: 29.48)
  price: {
    type: Number,
    required: true,
  },
  // The queue selected for the order
  queue: {
    type: String,
    enum: ["solo-duo", "flex"],
    required: true,
  },
  // The preferred roles of the client
  roles: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  // The preferred champions of the client
  champions: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  // The selected server for the order
  server: {
    type: String,
    enum: ["na", "lan", "eune", "euw", "oce"],
    required: true,
  },
  // The type of order
  type: {
    type: String,
    enum: [
      "duo-div-boost",
      "duo-games",
      "duo-net-wins",
      "duo-placement-matches",
      "solo-div-boost",
      "solo-net-wins",
      "solo-placement-matches",
    ],
    required: true,
  },
  // The timestamp of the order's payment
  created_on: {
    type: Date,
    default: Date.now,
  },
  // Whether the boost is completed by the booster
  isDone: {
    type: Boolean,
    default: false,
  },
  // Whether the order is available to all boosters in the "available orders" pool
  isInThePool: {
    type: Boolean,
    default: false,
  },
  // Whether the order is awaiting approval by an admin
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  // The order's confirmation number
  confirmationNumber: {
    type: String,
    default: "",
  },
  // The LoL username of the client (encrypted)
  lolUsername: {
    type: String,
    get: decrypt,
    set: encrypt,
  },
  // The LoL password of the client (encrypted)
  lolPassword: {
    type: String,
    get: decrypt,
    set: encrypt,
  },
  // The LoL in-game name of the client (encrypted)
  lolIgn: {
    type: String,
    get: decrypt,
    set: encrypt,
  },
  // Any special requirements by the client
  // (ex: "I want to play between 9pm and 11pm")
  specialRequirements: {
    type: String,
    default: "",
  },
});

// Get the order status
OrderSchema.methods.getStatus = function() {
  status = {};

  if (this.isDone) {
    status.handle = "done";
    status.name = "Completed";
    status.color = "#60cd8c";
  } else if (!this.isDone && this.booster) {
    status.handle = "in-progress";
    status.name = "In progress";
    status.color = "#f0b800";
  } else if (!this.isDone && !this.booster) {
    status.handle = "awaiting-a-booster";
    status.name = "Awaiting a booster";
    status.color = "#707080";
  } else {
    status.handle = "unknown";
    status.name = "Unknown";
    status.color = "#202020";
  }

  return status;
};

// Get the order queue
OrderSchema.methods.getQueue = function() {
  queue = {};
  switch (this.queue) {
    case "solo-duo":
      queue.name = "Solo/Duo Queue";
      queue.color = "#EC5F67";
      break;
    case "flex":
      queue.name = "Flex Queue";
      queue.color = "#60cd8c";
      break;
    default:
      queue.name = "No Queue";
      queue.color = "#bbbbbb";
      break;
  }
  return queue;
};

// Get the order server
OrderSchema.methods.getServer = function() {
  server = {};
  switch (this.server) {
    case "na":
      server.name = "NA (North America)";
      server.color = "#95C5F0";
      break;
    case "lan":
      server.name = "LAN";
      server.color = "#95C5F0";
	  break;
	case "eune":
      server.name = "EUNE";
      server.color = "#95C5F0";
	  break;
	case "euw":
      server.name = "EUW";
      server.color = "#95C5F0";
	  break;
	case "oce":
      server.name = "OCE";
      server.color = "#95C5F0";
      break;
    default:
      server.name = "No Server Specified";
      server.color = "#bbbbbb";
      break;
  }
  return server;
};

// Get the order type
OrderSchema.methods.getType = function() {
  type = {};
  switch (this.type) {
    case "duo-div-boost":
      type.name = "Duo Division Boost";
      type.prefix = "duo";
      type.color = "#4d85ff";
      break;
    case "duo-games":
      type.name = "Duo Games";
      type.prefix = "duo";
      type.color = "#4d85ff";
      break;
    case "duo-net-wins":
      type.name = "Duo Net Wins";
      type.prefix = "duo";
      type.color = "#4d85ff";
      break;
    case "duo-placement-matches":
      type.name = "Duo Placement Matches";
      type.prefix = "duo";
      type.color = "#4d85ff";
      break;
    case "solo-div-boost":
      type.name = "Solo Division Boost";
      type.prefix = "solo";
      type.color = "#f0b800";
      break;
    case "solo-net-wins":
      type.name = "Solo Net Wins";
      type.prefix = "solo";
      type.color = "#f0b800";
      break;
    case "solo-placement-matches":
      type.name = "Solo Placement Matches";
      type.prefix = "solo";
      type.color = "#f0b800";
      break;
    default:
      type.name = "No type";
      type.color = "#bbbbbb";
      break;
  }
  return type;
};

// Upon saving an order, generate a (yet unused) confirmation number
OrderSchema.pre("save", function(next) {
  var order = this;

  if (order.confirmationNumber == "" || !order.confirmationNumber) {
    order
      .model("Order")
      .find({}, "confirmationNumber")
      .then(function(previousConfirmationNumbers) {
        order.confirmationNumber = generateUniqueConfirmationNumber(previousConfirmationNumbers);
        return next();
      })
      .catch(function(err) {
        console.log(err);
        throw err;
      });
  } else {
    return next();
  }
});

function generateConfirmationNumber() {
  var ALPHABET = "0123456789abcdefghjkmnpqrtuvwxyz";

  var ID_LENGTH = 8;

  var rtn = "";
  for (var i = 0; i < ID_LENGTH; i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return rtn;
}

function generateUniqueConfirmationNumber(previousConfirmationNumbers) {
  previousConfirmationNumbers = previousConfirmationNumbers || [];

  var confirmationNumber = null;

  // Try to generate a unique confirmation number
  // i.e. one that isn't in the previous.
  while (!confirmationNumber) {
    confirmationNumber = generateConfirmationNumber();
    if (previousConfirmationNumbers.indexOf(confirmationNumber) !== -1) {
      confirmationNumber = null;
    }
  }

  return confirmationNumber;
}

module.exports = OrderSchema;
