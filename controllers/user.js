const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  req.flash("success", "Welcome back");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
