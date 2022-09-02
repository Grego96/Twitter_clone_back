const express = require("express");
const routes = express.Router();
const authController = require("../controllers/authController");

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

routes.post("/logout", authController.logOutUser);

// API-Routes
routes.get("/", verifyJwt, index);
routes.post("/users", storeUser);
routes.post("/login", token);
routes.post("/tweets", verifyJwt, storeTweet);
routes.get("/profiles/:id", verifyJwt, profile);
routes.delete("/tweets/:id", verifyJwt, destroy);
routes.post("/users/:id", verifyJwt, following);
routes.post("/likes/:id", verifyJwt, like);

module.exports = routes;
