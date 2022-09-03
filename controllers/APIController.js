const User = require("../models/User");
const Tweet = require("../models/Tweet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function storeUser(req, res) {
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });

  if (user) {
    res.json({ message: "User already exists with email or username." });
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
      if (error) return res.json({ error: "A field is missing." });
      res.json({ message: "A new user was created in the db." });
    });
  }
}

async function token(req, res) {
  const user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });

  if (user) {
    const compare = await bcrypt.compare(req.body.password, user.password);
    if (compare) {
      const token = jwt.sign({ user: user.username, id: user.id }, process.env.JWT_SECRET_STRING);
      res.json({ token });
    } else {
      res.json({ error: "Invalid credentials." });
    }
  } else {
    res.json({ error: "Invalid credentials." });
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
  res.json({
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
      return res.json({ message: "Something went wrong creating a tweet." });
    }
  });
  user.save((error) => {
    if (error) {
      return res.json({ message: "Something went wrong when updating the user." });
    }
  });
  return res.json({ message: "The user was updated in the DB." });
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
  res.json({ user: user, userProfileData: userProfileData });
}

async function destroy(req, res) {
  const user = await User.findById(req.auth.id).populate("tweets");
  const existTweet = user.tweets.some((tweet) => tweet.id === req.params.id);

  if (existTweet) {
    await Tweet.findByIdAndRemove(req.params.id);
    await User.findByIdAndUpdate(req.auth.id, {
      $pull: { tweets: req.params.id },
    });
    res.json({ message: "Tweet was deleted." });
  } else {
    res.json({ message: "The tweet does not exist." });
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
      res.json({ message: "Follow" });
    } else {
      const newFollowers = isFollow.followers.filter((follower) => {
        return follower._id.valueOf() !== req.auth.id;
      });
      isFollow.followers = newFollowers;
      const newFollowings = userFollowing.followings.filter((following) => {
        return following._id.valueOf() !== req.params.id;
      });
      userFollowing.followings = newFollowings;
      res.json({ message: "Unfollow" });
    }
    isFollow.save();
    userFollowing.save();
  } else {
    res.json({ message: "User not found." });
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
      res.json({ message: "Tweet liked!" });
    } else {
      const unlikedTweet = likedTweet.likes.filter((unlike) => {
        return unlike._id.valueOf() !== req.auth.id;
      });
      likedTweet.likes = unlikedTweet;
      res.json({ message: "Tweet unliked!" });
    }
    likedTweet.save();
  } else {
    res.json({ message: "Couldn't like/unlike tweet." });
  }
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
};
