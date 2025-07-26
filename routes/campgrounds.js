const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
// const { campgroundJoiSchema } = require("../joiSchema");
const { isLoggedIn, isAuthor, validateCampgrounds } = require("../middleware");
// const flash = require("connect-flash");
// const session = require("express-session");

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggedIn,
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "New Campground created successfully!!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const campground = await Campground.findById({ _id: id });
    if (!campground) {
      req.flash("error", "Cannot find the campground. Sorry!!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.patch(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await Campground.findByIdAndUpdate(
      { _id: id },
      { ...req.body.campground },
      { runValidators: true }
    );

    req.flash("success", "Campground updated successfully!!");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id/delete",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete({ _id: id });
    req.flash("success", "Campground deleted successfully!!");
    res.redirect("/campgrounds");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
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
  })
);

module.exports = router;
