const User = require("../models/User");
const Tweet = require("../models/Tweet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkJwt = require("express-jwt");

async function storeUser(req, res) {
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });

  if (user) {
    res.json({ message: "user already exists with email or username" });
  } else {
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 8),
    });
    newUser.save((error) => {
      if (error) return res.json({ message: "a field is missing" });
      res.json({ message: "a new user was created in the db" });
    });
  }
}

async function token(req, res) {
  const user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });
  console.log(user);

  if (user) {
    const compare = await bcrypt.compare(req.body.password, user.password);
    if (compare) {
      const token = jwt.sign(
        { user: user.username, id: user._id },
        process.env.JWT_SECRET_STRING
      );
      res.json({ token });
    } else {
      res.json({ message: "invalid credentials" });
    }
  } else {
    res.json({ message: "no user found" });
  }
}

async function index(req, res) {
  console.log(req.auth);
  const user = await User.findById(req.auth.id);
  const followings = user.followings;

  const tweets = await Tweet.find({
    user: { $in: followings },
  })
    .sort([["createdAt", "descending"]])
    .populate("user", "id firstname lastname username profileImage");
  res.json({ tweets });
}

async function storeTweet(req, res) {
  const newTweet = await new Tweet({
    text: req.body.text,
    user: req.auth.id,
  });
  const user = await User.findById(req.auth.id);
  user.tweets.push(newTweet.id);
  newTweet.save((error) => {
    if (error) {
      res.json({ message: "something went wrong creating a tweet" });
    }
  });
  user.save((error) => {
    if (error) {
      res.json({ message: "something went wrong when updating the user" });
    }
  });
  res.json({ message: "the user was updated in the DB" });
}

async function profile(req, res) {
  const userData = await User.findById(req.params.id)
    .select("id firstname lastname username profileImage")
    .populate("tweets")
    .sort([["createdAt", "descending"]]);
  res.json(userData);
}

async function destroy(req, res) {
  const user = await User.findById(req.auth.id).populate("tweets");
  const existTweet = user.tweets.some((tweet) => tweet.id === req.params.id);

  if (existTweet) {
    await Tweet.findByIdAndRemove(req.params.id);
    await User.findByIdAndUpdate(req.auth.id, {
      $pull: { tweets: req.params.id },
    });
    res.json({ message: "tweet was deleted" });
  } else {
    res.json({ message: "the tweet was not deleted" });
  }
}

async function following(req, res) {
  const userFollowing = await User.findById(req.auth.id);
  const isFollow = await User.findById(req.params.id);

  const isFollowing = userFollowing.followings.some((following) => {
    return following.valueOf() === req.params.id;
  });

  if (isFollow) {
    if (!isFollowing) {
      isFollow.followers.push(userFollowing.id);
      userFollowing.followings.push(isFollow.id);
      res.json({ message: "follow" });
    } else {
      const newFollowers = isFollow.followers.filter((follower) => {
        return follower._id.valueOf() !== req.auth.id;
      });
      isFollow.followers = newFollowers;
      const newFollowings = userFollowing.followings.filter((following) => {
        return following._id.valueOf() !== req.params.id;
      });
      userFollowing.followings = newFollowings;
      res.json({ message: "unfollow" });
    }
    isFollow.save();
    userFollowing.save();
  } else {
    res.json({ message: "user not found" });
  }
}

module.exports = {
  storeUser,
  token,
  index,
  storeTweet,
  profile,
  destroy,
  following,
};
