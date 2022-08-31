const Tweet = require("../models/Tweet");
const { faker } = require("@faker-js/faker");
require("../config/mongoConfig");

module.exports = async () => {
  
  const tweets = [];
  for (let i = 0; i < process.env.SEEDER_TOTAL_TWEETS; i++) {
    const tweet = new Tweet({
      text: faker.lorem.paragraph()
    });
    tweets.push(tweet);
  }
 
  return tweets
};
