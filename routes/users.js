const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { isLoggedIn, storeReturnTo } = require("../middleware");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      console.log(req.body);
      const user = new User({
        username: username,
        email: email,
      });

      const registeredUser = await User.register(user, password);
      // console.log(registeredUser);
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        req.flash("success", "Successfully created new user!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/campgrounds");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    req.flash("success", "Welcome back");
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
