const express = require("express");
const routes = express.Router();
const {
  storeUser,
  token,
  index,
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
routes.get("/", verifyJwt, userGlobal, index);
routes.post("/login", token);
routes.post("/users", storeUser);
routes.get("/users/:id", verifyJwt, userGlobal, profile);
routes.patch("/users/follow/:id", verifyJwt, following);
routes.post("/tweets", verifyJwt, storeTweet);
routes.patch("/tweets/like/:id", verifyJwt, like);
routes.delete("/tweets/:id", verifyJwt, destroy);

module.exports = routes;
