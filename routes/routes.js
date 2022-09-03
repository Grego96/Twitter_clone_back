const express = require("express");
const routes = express.Router();
const {
  storeUser,
  token,
  followingsTweets,
  storeTweet,
  profile,
  destroy,
  following,
  like,
} = require("../controllers/APIController");
const { expressjwt: jwt } = require("express-jwt");
const verifyJwt = jwt({
  secret: process.env.JWT_SECRET_STRING,
  algorithms: ["HS256"],
});
const userGlobal = require("../middlewares/userGobalAvailable");

// API-Routes
routes.post("/login", token);
routes.post("/users", storeUser); // store

routes.use(verifyJwt);

routes.get("/", userGlobal, followingsTweets);
routes.get("/users/:id", userGlobal, profile); // show
routes.patch("/users/:id/follow", following);
routes.post("/tweets", storeTweet); // store
routes.patch("/tweets/:id/like", like);
routes.delete("/tweets/:id", destroy);

module.exports = routes;
