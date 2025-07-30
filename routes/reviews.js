const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const { reviewJoiSchema } = require("../joiSchema");
const Campground = require("../models/campground");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/review");
const ExpressError = require("../utils/ExpressError");

const validateReviews = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

router.post("/", isLoggedIn, validateReviews, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
