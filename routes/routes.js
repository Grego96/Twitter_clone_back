const express = require("express");
const routes = express.Router();
const User = require("../models/User");
const Tweet = require("../models/Tweet");
const isAuthenticated = require("../middlewares/isAuthenticated");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const tweetController = require("../controllers/tweetController");
const {storeUser, token, index, storeTweet} = require("../controllers/APIController");
var { expressjwt: jwt } = require("express-jwt");
const verifyJwt = jwt({ secret: process.env.JWT_SECRET_STRING, algorithms: ["HS256"] });

// userRoutes.
// routes.post("/register", userController.store); // OK
// routes.get("/login", userController.login); // OK
// routes.post("/login", authController.login); // OK
routes.post("/logout", authController.logOutUser);

routes.post("/user/:id", isAuthenticated, userController.following);

// tweetsRoutes
routes.post("/", isAuthenticated, tweetController.store);
routes.get("/profile/:id", isAuthenticated, tweetController.profiles);
routes.delete("/delete/:id", isAuthenticated, tweetController.destroy);

// API-Routes
routes.get("/", verifyJwt, index);
routes.post("/users", storeUser);
routes.post("/login", token);
routes.post("/tweets", verifyJwt, storeTweet)

module.exports = routes;
