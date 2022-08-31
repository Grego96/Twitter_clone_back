const passport = require("passport");

function login(req, res) {
    passport.authenticate("local", {
      successRedirect: req.session.redirectTo ? req.session.redirectTo : "/",
      failureRedirect: "/login",
    })(req, res);
  }

function logOutUser(req, res) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        // res.redirect("/");
    });
}

module.exports = {
    login,
    logOutUser
};