var mongoose = require("mongoose");
var models = {};

// This maps every model in a single module for easy access from other files

models["User"] = mongoose.model("User", require("./user"));
models["Order"] = mongoose.model("Order", require("./order"));
models["Price"] = mongoose.model("Price", require("./price"));
models["Chat"] = mongoose.model("Chat", require("./chat"));
models["AdminSettings"] = mongoose.model("AdminSettings", require("./admin-settings"));
models["Promocode"] = mongoose.model("Promocode", require("./promocode"));

module.exports = models;
