const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const MAPBOXToken = process.env.MAPBOX_TOKEN;
const mbxClient = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxClient({ accessToken: MAPBOXToken });

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createNewCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  const dataset = await geocoder
    .forwardGeocode({
      query: `${campground.location}`,
      limit: 2,
    })
    .send();
  // console.log(dataset.body.features[0].geometry.coordinates);
  campground.author = req.user._id;
  campground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.geometry = dataset.body.features[0].geometry;
  console.log(campground);
  await campground.save();
  req.flash("success", "New Campground created successfully!!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;

  const campground = await Campground.findById({ _id: id });
  if (!campground) {
    req.flash("error", "Cannot find the campground. Sorry!!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.editCampground = async (req, res, next) => {
  const { id } = req.params;
  const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  // console.log(req.body);

  const campground = await Campground.findByIdAndUpdate(
    { _id: id },
    { ...req.body.campground },
    { runValidators: true }
  );

  campground.image.push(...images);
  console.log(campground.location, req.body.campground.location);
  const dataset = await geocoder
    .forwardGeocode({
      query: `${req.body.campground.location}`,
      limit: 2,
    })
    .send();
  console.log("dataset.body");
  console.log(dataset.body);
  campground.geometry = dataset.body.features[0].geometry;
  console.log("campground.geometry");
  console.log(campground.geometry);

  await campground.save();
  const imagesToDelete = req.body.deleteImages;
  if (req.body.deleteImages) {
    // console.log("inside if");
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    const res = await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
    // console.log("res:", res);
  }

  req.flash("success", "Campground updated successfully!!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete({ _id: id });
  req.flash("success", "Campground deleted successfully!!");
  res.redirect("/campgrounds");
};

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById({ _id: id })
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find the campground. Sorry!!");
    return res.redirect("/campgrounds");
  }
  // console.log(campground);
  res.render("campgrounds/show", { campground });
};
