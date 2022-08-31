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
      const newUser = new User({
        firstname: fields.firstname,
        lastname: fields.lastname,
        email: fields.email,
        username: fields.username,
        password: await bcrypt.hash(fields.password, 8),
        // profileImage: files.profileImage.newFilename,
      });
      newUser.save((error) => {
        if (error)
          return res.status(401).json({ error, msg: "Credenciales inválidas!" });
        return res.status(201).json("Se creó un nuevo usuario en la DB!");
      });
    });
  },

  token: async (req, res) => {
    const user = await User.findOne({
      username: req.body.username,
    });
    const compare = bcrypt.compare(req.body.password, user.password);

    if (user && compare) {
      const token = jwt.sign({ sub: user.username }, process.env.JWT_SECRET_STRING);
      res.json({ token });
    } else {
      res.json("Algo falló!");
    }
  },
};

module.exports = APIController;
