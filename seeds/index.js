const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const MAPBOXToken =
  "pk.eyJ1IjoiYXNoYWx1Y2tpbnNhbm9vcCIsImEiOiJjbGFmbXliamgwNnI1M29xbnE5bnZ2anpsIn0.wYv_xo6NGhFs7T4zR9_Flg";
const mbxClient = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxClient({ accessToken: MAPBOXToken });

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
  "68864913489b2afbcd032862",
  "68864e06eb9fc223f552b822",
  "6888ed9e82f071b6a77ca713",
];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const randomCityNo = Math.floor(Math.random() * 1000) + 1;
    const randomCity = cities[randomCityNo];
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const dataset = await geocoder
      .forwardGeocode({
        query: `${randomCity.city},${randomCity.state}`,
        limit: 2,
      })
      .send();
    const c = new Campground({
      title: `${sample(descriptors)}  ${sample(places)}`,
      location: `${randomCity.city},${randomCity.state}`,
      geometry: dataset.body.features[0].geometry,
      price: randomPrice,
      image: [
        {
          url: "https://res.cloudinary.com/dzbmrpcm4/image/upload/v1753727061/yelpCamp/kx8a04hx2obafzgfhkw4.jpg",
          filename: "yelpCamp/kx8a04hx2obafzgfhkw4",
        },
        {
          url: "https://res.cloudinary.com/dzbmrpcm4/image/upload/v1753727061/yelpCamp/puejplyzbst7bsnh0yqz.png",
          filename: "yelpCamp/puejplyzbst7bsnh0yqz",
        },
        {
          url: "https://res.cloudinary.com/dzbmrpcm4/image/upload/v1753727061/yelpCamp/kx1z6rmvfm5zvfechfs2.jpg",
          filename: "yelpCamp/kx1z6rmvfm5zvfechfs2",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi voluptates earum vel maxime accusantium dignissimos ipsam blanditiis repudiandae et, suscipit magnam totam odit voluptatum, veniam iste reprehenderit voluptatibus ex. A.",
      author: `${sample(userIds)}`,
    });
    await c.save();
  }
};

seedDB().then(() => [console.log("db connection CLOSED!")]);
