module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectTo = req.query.redirectTo;
    return res.redirect("/login");
  }
  return next();
};
