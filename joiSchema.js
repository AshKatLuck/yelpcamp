const sanitizeHTML = require("sanitize-html");
const baseJoi = require("joi");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": `{{#label}} must not include HTML!`,
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = baseJoi.extend(extension);

const campgroundJoiSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    price: Joi.number().min(0).required(),
    // image: Joi.string().required(),
    description: Joi.string().required().escapeHTML(),
  }),
  deleteImages: Joi.array(),
}).required();

const reviewJoiSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }),
}).required();
module.exports = { campgroundJoiSchema, reviewJoiSchema };
// module.exports = reviewJoiSchema;
