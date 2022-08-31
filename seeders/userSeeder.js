const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

require("../config/mongoConfig");

module.exports = async () => {
  const newUsers = [];
  for (let i = 0; i < process.env.SEEDER_TOTAL_USERS; i++) {
    const user = new User({
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: await bcrypt.hash("banana", 8),
      description: faker.lorem.paragraph(),
      profileImage: faker.image.avatar(),
      tweets: [],
    });
    newUsers.push(user);
  }

  return newUsers;
};
