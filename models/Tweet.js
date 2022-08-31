const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
  text: {
    type: String,
    // maxLength: 140,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    inmmutable: true,
    default: () => Date.now(),
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
