const express = require("express");
const routes = express.Router();
const User = require("../models/User");
const Tweet = require("../models/Tweet");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const tweetController = require("../controllers/tweetController");
const {
  storeUser,
  token,
  index,
  storeTweet,
  profile,
  destroy,
} = require("../controllers/APIController");
const { expressjwt: jwt } = require("express-jwt");
const verifyJwt = jwt({
  secret: process.env.JWT_SECRET_STRING,
  algorithms: ["HS256"],
});

routes.post("/logout", authController.logOutUser);

routes.post("/user/:id", isAuthenticated, userController.following);

// API-Routes
routes.get("/", verifyJwt, index);
routes.post("/users", storeUser);
routes.post("/login", token);
routes.post("/tweets", verifyJwt, storeTweet);
routes.get("/profiles/:id", verifyJwt, profile);
routes.delete("/tweets/:id", verifyJwt, destroy);

module.exports = routes;
