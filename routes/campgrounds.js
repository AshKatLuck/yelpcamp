const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { campgroundJoiSchema } = require("../joiSchema");
// const flash = require("connect-flash");
// const session = require("express-session");

//Joi middleware functions
const validateCampgrounds = (req, res, next) => {
  console.log("inside validateCampgrounds");
  const { error } = campgroundJoiSchema.validate(req.body);
  console.log(error);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "New Campground created successfully!!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

router.get(
  "/:id/edit",
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
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const campground = req.body.campground;

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
    const campground = await Campground.findById({ _id: id }).populate(
      "reviews"
    );
    if (!campground) {
      req.flash("error", "Cannot find the campground. Sorry!!");
      return res.redirect("/campgrounds");
    }
    // console.log(campground);
    res.render("campgrounds/show", { campground });
  })
);

module.exports = router;
