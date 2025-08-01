if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// console.log(process.env.SECRET);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engineMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const usersRouter = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// const sanitizeV5 = require("./utils/mongoSanitizeV5");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

const app = express();
// app.set("query parser", "extended"); //for sanitizeV5

app.use(mongoSanitize());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
// app.use(sanitizeV5());

app.engine("ejs", engineMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const dburl = process.env.DBURL;
// const dburl = "mongodb://127.0.0.1:27017/yelp-camp";

const store = MongoStore.create({
  mongoUrl: dburl,
  touchAfter: 24 * 60 * 60,
});

//session configuration
const sessionConfig = {
  store: store,
  name: "giveANonObviousName",
  secret: "badsecret",
  saveUninitialized: true,
  // secure:true,
  resave: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

//passport stuff has to be after session config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash

app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  })
);
app.use((req, res, next) => {
  // console.log(req.query); //for testing teh sanitizing
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", usersRouter);
app.use("/campgrounds/:id/review", reviewsRouter);
app.use("/campgrounds", campgroundsRouter);

//Connect to mongoAtlas
// mongoose
//   .connect(dburl)
//   .then(() => {
//     console.log("MONGODB CONNECTION DONE");
//   })
//   .catch((err) => {
//     console.log("MONGODB ERROR!!");
//     console.error(err);
//   });

//Connect to local db
mongoose
  .connect(dburl)
  .then(() => {
    console.log("MONGODB CONNECTION DONE");
  })
  .catch((err) => {
    console.log("MONGODB ERROR!!");
    console.error(err);
  });

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "asha@gmail.com", username: "asha" });
//   const userWithHashedPassword = await User.register(user, "karthika");
//   res.send(userWithHashedPassword);
// });

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
