const Joi = require("joi");
const campgroundJoiSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
  }),
});
module.exports = campgroundJoiSchema;
