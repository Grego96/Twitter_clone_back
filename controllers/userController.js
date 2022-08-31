const User = require("../models/User");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const path = require("path");
/////////

const userControllers = {
  login: (req, res) => {
    res.render("login");
  },

  create: (req, res) => {
    res.render("register");
  },

  store: async (req, res) => {
    const user = User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    }).exec(function (err, user) {
      if (user) {
        res.json("user already exists with email or username");
      } //user already exists with email AND/OR phone.
      const form = formidable({
        multiples: true,
        uploadDir: path.join(__dirname, "../public/img"),
        keepExtensions: true,
      });
      form.parse(req, async (error, fields, files) => {
        const newUser = new User({
          firstname: fields.firstname,
          lastname: fields.lastname,
          email: fields.email,
          username: fields.username,
          password: await bcrypt.hash(fields.password, 8),
          profileImage: files.profileImage.newFilename,
        });
        newUser.save((error) => {
          if (error) return console.log(error);
          console.log("Se creó un nuevo usuario en la DB!");
        });
        res.redirect("/");
      });
    });
  },
  following: async (req, res) => {
    const userSeguido = await User.findById(req.params.id);
    const userSigue = await User.findById(req.user.id);
    userSeguido.followers.push(userSigue.id);
    userSigue.followings.push(userSeguido.id);
    userSeguido.save();
    userSigue.save();
    res.redirect("/");
  },
};

module.exports = userControllers;
