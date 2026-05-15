const Joi = require("joi");

const createBookingSchema = Joi.object({
  vehicleId: Joi.string().required(),
  startDate: Joi.date().iso().min("now").required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  pricing: Joi.object({
    dailyRate: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
  }).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "cancelled", "completed").required(),
});

module.exports = {
  createBookingSchema,
  updateStatusSchema,
};
