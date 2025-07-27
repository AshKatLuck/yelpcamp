const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampgrounds } = require("../middleware");
const campgrounds = require("../controllers/campground");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    validateCampgrounds,
    catchAsync(campgrounds.createNewCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .patch(
    isLoggedIn,
    isAuthor,
    validateCampgrounds,
    catchAsync(campgrounds.editCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// router.get("/", catchAsync(campgrounds.index));

// router.post(
//   "/",
//   isLoggedIn,
//   validateCampgrounds,
//   catchAsync(campgrounds.createNewCampground)
// );

// router.patch(
//   "/:id",
//   isLoggedIn,
//   isAuthor,
//   validateCampgrounds,
//   catchAsync(campgrounds.editCampground)
// );

// router.delete(
//   "/:id/delete",
//   isLoggedIn,
//   isAuthor,
//   catchAsync(campgrounds.deleteCampground)
// );

// router.get("/:id", catchAsync(campgrounds.showCampground));

module.exports = router;
