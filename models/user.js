var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var SALT_WORK_FACTOR = 12;
var validator = require("validator");

var Order = mongoose.model("Order", require("./order"));

// This schema represents a Boost Kings user/booster/admin
var UserSchema = mongoose.Schema({
  // User's email address
  email: {
    type: String,
    required: [true, "Email address required."],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address.",
    },
    isAsync: false,
  },
  // User's new desired email address (before confirmation)
  emailToChange: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address.",
    },
  },
  // User's hashed password
  password: {
    type: String,
    required: [true, "Password required."],
    minlength: [8, "Password must be at least 8 characters."],
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  // Whether the user's email is verified
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  // Tokens used when the user wants to change their email
  verifyEmailToken: String,
  changeEmailToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // The user's permission groups
  group: {
    type: String,
    enum: ["admin", "booster", "user"],
    required: true,
    default: "user",
  },
});

// Hashes the password
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Validates the supplied password against the stored hash
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.checkEmailAlreadyExists = function(email) {
  return this.model("User")
    .findOne({ email: email })
    .then(function(result) {
      return result !== null;
    });
};

// Returns true if the user is an admin, false otherwise
UserSchema.methods.isAdmin = function() {
  return this.group == "admin";
};

// Returns true if the user is a booster, false otherwise
UserSchema.methods.isBooster = function() {
  return this.group == "booster";
};

// Returns true if the user is a normal user, false otherwise
UserSchema.methods.isUser = function() {
  return this.group == "user";
};

// Returns true if the user is part of the Boost Kings staff, false otherwise
UserSchema.methods.isStaff = function() {
  return this.group == "booster" || this.group == "admin";
};

// Returns a list of all Boost Kings boosters and their order stats
UserSchema.statics.getBoosters = function(callback) {
  const User = this;
  User.find({ group: "booster" })
    .sort("-created_on")
    .lean()
    .exec(function(err, boosters) {
      if (err) {
        return callback(err);
      } else {
        Order.find()
          .populate("booster")
          .exec(function(err, orders) {
            if (err) {
              return callback(err);
            } else {
              boosters.forEach(function(b) {
                b.orders = {};
                b.orders.inProgress = 0;
                b.orders.done = 0;

                orders.forEach(function(o) {
                  if (b && o && o.booster && b._id.toString() == o.booster._id.toString()) {
                    if (o.isDone) {
                      b.orders.done += 1;
                    } else {
                      b.orders.inProgress += 1;
                    }
                  }
                });
              });

              return callback(null, boosters);
            }
          });
      }
    });
};

// Returns a specific Boost Kings booster by ID, with their order stats
UserSchema.statics.getBooster = function(boosterId, callback) {
  const User = this;
  User.findOne({ _id: boosterId, group: "booster" })
    .sort("-created_on")
    .lean()
    .exec(function(err, b) {
      if (err) {
        return callback(err);
      } else {
        Order.find()
          .populate("booster")
          .exec(function(err, orders) {
            if (err) {
              return callback(err);
            } else {
              b.orders = {};
              b.orders.requiresApproval = [];
              b.orders.inProgress = [];
              b.orders.done = [];

              orders.forEach(function(o) {
                if (b && o && o.booster && b._id.toString() == o.booster._id.toString()) {
                  if (o.isDone) {
                    b.orders.done.push(o);
                  } else if (o.requiresApproval) {
                    b.orders.requiresApproval.push(o);
                  } else {
                    b.orders.inProgress.push(o);
                  }
                }
              });

              return callback(null, b);
            }
          });
      }
    });
};

// Returns a list of all normal users
UserSchema.statics.getUsers = function(callback) {
  const User = this;
  User.find({ group: "user" })
    .sort("-created_on")
    .lean()
    .exec(function(err, users) {
      if (err) {
        return callback(err);
      } else {
        Order.find()
          .populate("user")
          .exec(function(err, orders) {
            if (err) {
              return callback(err);
            } else {
              users.forEach(function(u) {
                u.orders = {};
                u.orders.inProgress = 0;
                u.orders.done = 0;
                u.orders.totalSpent = 0;

                orders.forEach(function(o) {
                  if (u && o && o.user && u._id.toString() == o.user._id.toString()) {
                    u.orders.totalSpent += o.price;
                    if (o.isDone) {
                      u.orders.done += 1;
                    } else {
                      u.orders.inProgress += 1;
                    }
                  }
                });
              });

              return callback(null, users);
            }
          });
      }
    });
};

// Upon saving a user, hash & salt their password
UserSchema.pre("save", function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

module.exports = UserSchema;
