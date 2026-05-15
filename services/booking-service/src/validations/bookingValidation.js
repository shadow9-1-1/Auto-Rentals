const Joi = require("joi");

const createBookingSchema = Joi.object({
  vehicle: Joi.object({
    vehicleId: Joi.string().required(),
    make: Joi.string(),
    model: Joi.string(),
    year: Joi.number(),
  }).required(),
  startDate: Joi.date().iso().min("now").required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  pricing: Joi.object({
    totalAmount: Joi.number().min(0).required(),
    currency: Joi.string().default("USD"),
  }).required(),
  renter: Joi.object({
    userId: Joi.string(),
    fullName: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required(),
});

module.exports = {
  createBookingSchema,
  updateStatusSchema,
};
