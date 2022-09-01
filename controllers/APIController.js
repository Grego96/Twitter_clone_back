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
    res.json("user already exists with email or username");
  } else {
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 8),
    });
    newUser.save((error) => {
      if (error) return res.json({ message: "falta un campo" });
      res.json("Se creó un nuevo usuario en la DB!");
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
      const token = jwt.sign(
        { user: user.username, id: user.id },
        process.env.JWT_SECRET_STRING
      );
      res.json({ token });
    } else {
      res.json("credenciales invalidas");
    }
  } else {
    res.json("No se encontro al usuario");
  }
}

async function index(req, res) {
  // console.log(req.auth);
  const user = await User.findById(req.auth.id);
  const followings = user.followings;

  const tweets = await Tweet.find({
    user: { $in: followings },
  })
    .sort([["createdAt", "descending"]])
    .populate("user");
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
      res.json({ message: "algo salio mal al crear un tweet" });
    }
  });
  user.save((error) => {
    if (error) {
      res.json({ message: "algo salio mal al actualizar el usuario" });
    }
  });
  res.json({ message: "se actualizo el usuario en la DB" });
}

async function profile(req, res) {
  const userData = await User.findById(req.params.id)
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
    res.json({ message: "se eliminó el tweet" });
  } else {
    res.json({ message: "no se elimino el tweet" });
  }
}

async function following(req, res) {
  const userFollowing = await User.findById(req.auth.id);
  const follower = await User.findById(req.params.id);
  const isFollowing = userFollowing.followings.some((following) => {
    return req.params.id === following.id;
  });
  if (!isFollowing) {
    follower.followers.push(userFollowing.id);
    userFollowing.followings.push(follower.id);
  } else {
    follower.followers.filter((follower) => {
      return follower.id !== req.auth.id;
    });
  }
  follower.save();
  userFollowing.save();
}

module.exports = {
  storeUser,
  token,
  index,
  storeTweet,
  profile,
  destroy,
};
