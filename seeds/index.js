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
const userIds = [
  "6883bdedd1e3b85c4c55ea1f",
  "6883d0cdafdfe6d5259c2ba4",
  "6883d33e4f0f42097bfa769c",
  "6883f3d3f2f2f271bdf49c6c",
];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCityNo = Math.floor(Math.random() * 1000) + 1;
    const randomCity = cities[randomCityNo];
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const c = new Campground({
      title: `${sample(descriptors)}  ${sample(places)}`,
      location: `${randomCity.city},${randomCity.state}`,
      price: randomPrice,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi voluptates earum vel maxime accusantium dignissimos ipsam blanditiis repudiandae et, suscipit magnam totam odit voluptatum, veniam iste reprehenderit voluptatibus ex. A.",
      author: `${sample(userIds)}`,
    });
    await c.save();
  }
};

seedDB().then(() => [console.log("db connection CLOSED!")]);
