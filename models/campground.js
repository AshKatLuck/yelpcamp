const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

CampgroundSchema.post("findOneAndDelete", async function (data) {
  if (data) {
    // console.log(data);
    const del = await Review.deleteMany({ _id: { $in: data.reviews } });
    // console.log("deleted stuff");
    // console.log(del);
  }
});

const Campground = mongoose.model("Campground", CampgroundSchema);
module.exports = Campground;
