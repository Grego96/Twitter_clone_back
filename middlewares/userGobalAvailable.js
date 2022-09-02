const User = require("../models/User")

module.exports = async function (req, res, next) { 
    const user = await User.findById(req.auth.id).select("id firstname lastname username email description profileImage")
    req.user = user;
    next()
 }