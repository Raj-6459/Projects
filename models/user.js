const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// passport-local-mongoose exports the plugin as the default property
// since v9, so we need to extract it when requiring.
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
