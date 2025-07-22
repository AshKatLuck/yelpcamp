const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const engineMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
// const campgroundJoiSchema = require("./campgroundJoiSchema");
// const reviewJoiSchema = require("./campgroundJoiSchema");
const Review = require("./models/review");
const {
  campgroundJoiSchema,
  reviewJoiSchema,
} = require("./campgroundJoiSchema");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGODB CONNECTION DONE");
  })
  .catch((err) => {
    console.log("MONGODB ERROR!!");
    console.error(err);
  });

app.engine("ejs", engineMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

const validateReviews = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const campground = new Campground(req.body.campground);
    await campground.save();

    res.redirect(`/campgrounds/${campground.id}`);
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById({ _id: id });
    res.render("campgrounds/edit", { campground });
  })
);

app.patch(
  "/campgrounds/:id",
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = req.body.campground;
    await Campground.findByIdAndUpdate(
      { _id: id },
      { ...req.body.campground },
      { runValidators: true }
    );
    res.redirect(`/campgrounds/${id}`);
  })
);

app.post(
  "/campgrounds/:id/review",
  validateReviews,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    console.log(campground, review);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/review/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // console.log(id, reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id/delete",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete({ _id: id });
    res.redirect("/campgrounds");
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById({ _id: id }).populate(
      "reviews"
    );
    // console.log(campground);
    res.render("campgrounds/show", { campground });
  })
);

app.get("/", (req, res) => {
  res.render("home");
});

app.all(/(.*)/, (req, res, next) => {
  // console.log("in app.all");
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  // console.log("in app.use last one");
  const { statusCode = 500, message } = err;
  if (!err.message) err.message = "Something went wrong";
  // console.log(message, statusCode);
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("listening at port 3000");
});
