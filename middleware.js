const Campground = require("./models/campground");
const { campgroundJoiSchema } = require("./joiSchema");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");

//Joi middleware functions
module.exports.validateCampgrounds = (req, res, next) => {
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

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.user);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be logged in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const c = await Campground.findById(id);
  if (!c.author.equals(req.user._id)) {
    req.flash("error", "No permission to edit this campground");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const r = await Review.findById(reviewId);
  if (!r.author.equals(req.user._id)) {
    req.flash("error", "No permission to edit this review");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
