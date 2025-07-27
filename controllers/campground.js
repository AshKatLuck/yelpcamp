const Campground = require("../models/campground");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createNewCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
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

  await Campground.findByIdAndUpdate(
    { _id: id },
    { ...req.body.campground },
    { runValidators: true }
  );

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
