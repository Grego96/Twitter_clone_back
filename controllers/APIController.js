const User = require("../models/User");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const path = require("path");
const jwt = require("jsonwebtoken");
const checkJwt = require("express-jwt");

const APIController = {
  storeUser: async (req, res) => {
    const form = formidable({
      multiples: true,
      uploadDir: path.join(__dirname, "../public/img"),
      keepExtensions: true,
    });
    form.parse(req, async (error, fields, files) => {
      const user = await User.findOne({
        $or: [{ email: fields.email }, { username: fields.username }],
      });

      if (user) {
        res.json("user already exists with email or username");
      } else {
        const newUser = new User({
          firstname: fields.firstname,
          lastname: fields.lastname,
          email: fields.email,
          username: fields.username,
          password: await bcrypt.hash(fields.password, 8),
          // profileImage: files.profileImage.newFilename,
        });
        newUser.save((error) => {
          if (error) return console.log(error);
          res.json("Se creó un nuevo usuario en la DB!");
        });
      }
    });
  },

  token: async (req, res) => {
    const user = await User.findOne({
     $or:[ {username: req.body.username}, {email: req.body.email} ] 
    });

    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        const token = jwt.sign(
          { sub: user.username },
          process.env.JWT_SECRET_STRING
        );
        res.json({ token });
      } else {
        res.json("credenciales invalidas");
      }
    } else {
      res.json("No se encontro al usuario");
    }
  },
};

module.exports = APIController;
