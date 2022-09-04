const User = require("../models/User");
const Tweet = require("../models/Tweet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash")

async function storeUser(req, res) {
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });
  if (user) {
    res.status(400).json({ message: "User already exists with email or username." });
  } else {
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 8),
      profileImage: req.body.profileImage
        ? req.body.profileImage
        : "../public/img/a0e243b3a508306970f49bc00.jpg",
    });
    newUser.save((error) => {
      if (error) return res.status(400).json({ message: "A field is missing." });
      res.status(201).json({ message: "A new user was created in the db." });
    });
  }
}

async function token(req, res) {
  const user = await User.findOne({
    $or: [{ username: req.body.userNameToLogin }, { email: req.body.userNameToLogin }],
  });

  if (user) {
    const compare = await bcrypt.compare(req.body.password, user.password);
    if (compare) {
      const token = jwt.sign({ user: user.username, id: user.id }, process.env.JWT_SECRET_STRING);
      res.status(200).json({ token });
    } else {
      res.status(400).json({ message: "Invalid credentials." });
    }
  } else {
    res.status(400).json({ message: "Invalid credentials." });
  }
}

async function followingsTweets(req, res) {
  const user = await User.findById(req.auth.id).select(
    "id firstname lastname username email description profileImage tweets followers followings",
  );
  const followings = user.followings;
  followings.push(req.auth.id);

  const tweets = await Tweet.find({
    user: { $in: followings },
  })
    .sort([["createdAt", "descending"]])
    .populate("user", "id firstname lastname username profileImage");
  res.status(200).json({
    user: user,
    tweets: tweets,
  });
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
      return res.status(400).json({ message: "Something went wrong creating a tweet." });
    }
  });
  user.save((error) => {
    if (error) {
      return res.status(400).json({ message: "Something went wrong when updating the user." });
    }
  });
  return res.status(200).json({ message: "The user was updated in the DB." });
}

async function profile(req, res) {
  const user = await User.findById(req.auth.id).select(
    "id firstname lastname username email description profileImage tweets followers followings",
  );
  const userProfileData = await User.findById(req.params.id)
    .select(
      "id firstname lastname username email description profileImage tweets followers followings",
    )
    .populate("tweets")
    .sort([["createdAt", "descending"]]);
  res.status(200).json({ user: user, userProfileData: userProfileData });
}

async function destroy(req, res) {
  const user = await User.findById(req.auth.id).populate("tweets");
  const existTweet = user.tweets.some((tweet) => tweet.id === req.params.id);

  if (existTweet) {
    await Tweet.findByIdAndRemove(req.params.id);
    await User.findByIdAndUpdate(req.auth.id, {
      $pull: { tweets: req.params.id },
    });
    res.status(200).json({ message: "Tweet was deleted." });
  } else {
    res.status(404).json({ message: "The tweet does not exist." });
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
      res.status(200).json({ message: "Follow" });
    } else {
      const newFollowers = isFollow.followers.filter((follower) => {
        return follower._id.valueOf() !== req.auth.id;
      });
      isFollow.followers = newFollowers;
      const newFollowings = userFollowing.followings.filter((following) => {
        return following._id.valueOf() !== req.params.id;
      });
      userFollowing.followings = newFollowings;
      res.status(200).json({ message: "Unfollow" });
    }
    isFollow.save();
    userFollowing.save();
  } else {
    res.status(404).json({ message: "User not found." });
  }
}

async function like(req, res) {
  const likedTweet = await Tweet.findById(req.params.id);

  const isLiked = likedTweet.likes.some((like) => {
    return like.valueOf() === req.auth.id;
  });

  if (likedTweet) {
    if (!isLiked) {
      likedTweet.likes.push(req.auth.id);
      res.status(200).json({ message: "Tweet liked!" });
    } else {
      const unlikedTweet = likedTweet.likes.filter((unlike) => {
        return unlike._id.valueOf() !== req.auth.id;
      });
      likedTweet.likes = unlikedTweet;
      res.status(200).json({ message: "Tweet unliked!" });
    }
    likedTweet.save();
  } else {
    res.status(404).json({ message: "Couldn't like/unlike tweet." });
  }
}

async function getRandomsUnfollowers(req, res) {
  const Unfollowers = await User.find({ "followers": { "$ne": req.auth.id } }).select(
    "id firstname lastname username email description profileImage tweets followers followings",
  );
  const randomsUnfollowers = _.sampleSize(Unfollowers, req.query.number)
  res.status(200).json({ randomsUnfollowers })
}

module.exports = {
  storeUser,
  token,
  followingsTweets,
  storeTweet,
  profile,
  destroy,
  following,
  like,
  getRandomsUnfollowers
};
