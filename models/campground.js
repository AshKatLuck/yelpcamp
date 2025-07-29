const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/c_thumb,w_200,g_face");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    image: [ImageSchema],
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
  },
  opts
);

CampgroundSchema.virtual("properties.popupMarkup").get(function () {
  return `<strong><a href=/campgrounds/${this._id}>${this.title}</a></strong><p>${this.location}</p>`;
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

// https://res.cloudinary.com/dzbmrpcm4/image/upload/v1753737658/yelpCamp/be4b8xwrhcfyw1fv4rix.jpg
// https://res.cloudinary.com/dzbmrpcm4/image/upload/c_thumb,w_200,g_face/v1753737658/yelpCamp/be4b8xwrhcfyw1fv4rix.jpg
