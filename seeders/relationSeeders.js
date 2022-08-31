const _ = require("lodash");
const colors = require("colors")
const User = require("../models/User");
const Tweet = require("../models/Tweet");
require("../config/mongoConfig");

module.exports = async () => {
  const users = await require("./userSeeder")();
  const tweets = await require("./tweetSeeder")();

  for (const user of users) {
    let chosenUsers = _.sampleSize(users, _.random(0, 5)).filter((u) => u.id !== user.id);

    for (const chosenUser of chosenUsers) {
      user.followers.push(chosenUser.id);
      chosenUser.followings.push(user.id);
    }
  }

  for (const tweet of tweets) {
    const chosenUser = _.sample(users);
    tweet.user = chosenUser.id;
    chosenUser.tweets.push(tweet.id);
  }

  User.insertMany(users);
  Tweet.insertMany(tweets);

  console.log(`
                ______________________________________
     ^   ^      ______                        ________     ^   ^
  ヾ(=0ω0=)ノ”  ______ Users and Tweets DONE! ________  ヾ(=0ω0=)ノ”
                ______________________________________
                
  ` .green);
};
