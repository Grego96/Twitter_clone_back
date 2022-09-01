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
      if (error) return console.log(error);
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
  const user = await User.findById(req.auth.id)
  const followings = user.followings
  console.log(user.followings);

  const tweets = await Tweet.find({
    "user": { $in: 
      followings
     }
  })
    .sort([["createdAt", "descending"]])
    .populate("user");
 console.log(tweets.length);
  res.json({ tweets });
}

module.exports = {
  storeUser,
  token,
  index,
};
