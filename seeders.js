async function runAllSeeders() {
  require("mongoose").connection.dropDatabase();
  await require("./seeders/relationSeeders")();
}

runAllSeeders();
