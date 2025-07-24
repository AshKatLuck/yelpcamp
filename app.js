const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engineMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");
const { campgroundJoiSchema, reviewJoiSchema } = require("./joiSchema");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

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
const sessionConfig = {
  secret: "badsecret",
  saveUninitialized: true,
  resave: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

//middleware for flash

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds/:id/review", reviewsRouter);
app.use("/campgrounds", campgroundsRouter);

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
