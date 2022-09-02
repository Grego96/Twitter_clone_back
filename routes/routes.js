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
const userGlobal = require("../middlewares/userGobalAvailable")

routes.post("/logout", authController.logOutUser);

// API-Routes
routes.get("/", verifyJwt, userGlobal, index);
routes.post("/users", storeUser);
routes.post("/login", token);
routes.post("/tweets", verifyJwt, userGlobal, storeTweet);
routes.get("/profiles/:id", verifyJwt, userGlobal, profile);
routes.delete("/tweets/:id", verifyJwt, userGlobal, destroy);
routes.post("/users/:id", verifyJwt, userGlobal, following);
routes.post("/likes/:id", verifyJwt, userGlobal, like);

module.exports = routes;
