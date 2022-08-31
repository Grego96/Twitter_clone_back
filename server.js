require("dotenv").config();

const express = require("express");
const routes = require("./routes");
const APP_PORT = process.env.APP_PORT || 3000;
const app = express();
const mongoose = require("mongoose");
const Tweet = require("./models/Tweet");
const passport = require("passport");
const session = require("express-session");
const methodOverride = require("method-override");

require("./config/mongoConfig"); // mongoose connect <-----
require("./config/passportConfig");

app.use(session({ secret: "AlgúnTextoSuperSecreto", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.url = req.url;
  next();
});

app.set("view engine", "ejs");

routes(app);

app.listen(APP_PORT, () => {
  console.log(`\n[Express] Servidor corriendo en el puerto ${APP_PORT}.`);
  console.log(`[Express] Ingresar a http://localhost:${APP_PORT}.\n`);
});
