const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  description: String,
  profileImage: String,
  tweets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followings: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
