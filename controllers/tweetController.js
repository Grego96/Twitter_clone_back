const Tweet = require("../models/Tweet");
const User = require("../models/User");
const _ = require("lodash");

const tweetControllers = {
  index: async (req, res) => {
    const tweets = await Tweet.find()
      .sort([["createdAt", "descending"]])
      .populate("user");
    res.json({ tweets });
  },

  store: async (req, res) => {
    const newTweet = await new Tweet({
      text: req.body.text,
      user: req.user,
    });

    const user = await User.findById(req.user.id);
    user.tweets.push(newTweet.id);

    newTweet.save((error) => {
      if (error) return console.log(error);
      console.log("Se creó un nuevo tweet en la DB");
    });
    user.save((error) => {
      if (error) return console.log(error);
      console.log("se actualizo los tweets");
    });
    res.redirect("/");
  },

  profiles: async (req, res) => {
    const users = await User.find();
    function filtrarUsers(u) {
      let exist = false;
      for (const follow of req.user.followings) {
        if (u.id === follow.id) {
          exist = true;
        }
      }
      if (u.id !== req.user.id && !exist) {
        return u;
      }
    }
    let rondomUsers = _.sampleSize(users, _.random(5, 7)).filter(filtrarUsers);

    const userTweets = await User.findById(req.params.id)
      .populate("tweets")
      .sort([["createdAt", "descending"]]);
    res.render("profile", { userTweets, user: req.user, rondomUsers });
  },

  destroy: async (req, res) => {
    const user = await User.findById(req.auth.id).populate("tweets");
    const existTweet = user.tweets.some((tweet) => tweet.id === req.body.id);

    if (existTweet) {
      await Tweet.findByIdAndRemove(req.body.id);
      await User.findByIdAndUpdate(req.auth.id, {
        $pull: { tweets: req.body.id },
      });
    } else {
      res.json({ message: "no se elimino el tweet" });
    }
    res.json({ message: "se eliminó el tweet" });
  },
};

module.exports = tweetControllers;
