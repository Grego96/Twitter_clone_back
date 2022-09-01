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

module.exports = {
  storeUser,
  token,
  index,
  storeTweet,
  profile,
};
