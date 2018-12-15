var mongoose = require("mongoose");

var AdminSettingsSchema = mongoose.Schema(
  {
    // Message shown to boosters on their dashboard
    messageForBoosters: {
      type: String,
      required: false,
    },
    // Exit popup rebate percentage
    exitRebatePercentage: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AdminSettingsSchema.statics.getSettings = function(callback) {
  const AdminSettings = this;
  AdminSettings.findOne()
    .sort("-created_on")
    .exec(function(err, settings) {
      if (err) throw err;
      if (!settings) {
        // Initialize settings if none in database (poor man's database seed)
        console.log("No settings in database! Creating settings...");
        settings = new AdminSettings();
        settings.messageForBoosters = "";
        settings.exitRebatePercentage = 5;
        settings.save(function(err) {
          if (err) throw err;
          // return the most recent admin settings entry
          return AdminSettings.findOne()
            .sort("-created_on")
            .exec(callback);
        });
      } else {
        // return the most recent admin settings entry
        return AdminSettings.findOne()
          .sort("-created_on")
          .exec(callback);
      }
    });
};

module.exports = AdminSettingsSchema;
