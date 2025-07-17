const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("./models/campground");
const methodOverride = require("method-override");

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground.id}`);
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById({ _id: id });
  res.render("campgrounds/edit", { campground });
});

app.patch("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = req.body.campground;
  await Campground.findByIdAndUpdate(
    { _id: id },
    { title: campground.title, location: campground.location }
  );
  res.redirect(`/campgrounds/${id}`);
});

app.delete("/campgrounds/:id/delete", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete({ _id: id });
  res.redirect("/campgrounds");
});

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById({ _id: id });
  res.render("campgrounds/show", { campground });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("listening at port 3000");
});
