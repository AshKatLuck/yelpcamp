const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGODB CONNECTION DONE");
  })
  .catch((err) => {
    console.log("MONGODB ERROR!!");
    console.error(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCityNo = Math.floor(Math.random() * 1000) + 1;
    const randomCity = cities[randomCityNo];
    const c = new Campground({
      title: `${sample(descriptors)}  ${sample(places)}`,
      location: `${randomCity.city},${randomCity.state}`,
    });
    await c.save();
  }
};

seedDB().then(() => [console.log("db connection CLOSED!")]);
