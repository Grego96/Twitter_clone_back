const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

mongoose.connect(process.env.DB_CONNECTION_STRING);
mongoose.connection
  .once("open", () => console.log("¡Conexión con la base de datos establecida!"))
  .on("error", (error) => console.log(error));
