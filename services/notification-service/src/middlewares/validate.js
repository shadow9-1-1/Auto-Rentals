const Joi = require("joi");
const logger = require("../utils/logger");

/**
 * Middleware to validate request components against a Joi schema.
 * @param {Object} schemas - Object containing Joi schemas for 'body', 'query', and/or 'params'.
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const validations = ["body", "query", "params"];
    const errors = [];

    validations.forEach((type) => {
      if (schemas[type]) {
        const { error, value } = schemas[type].validate(req[type], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              type,
              message: detail.message,
              path: detail.path,
            }))
          );
        } else {
          // Replace request data with validated/sanitized value
          req[type] = value;
        }
      }
    });

    if (errors.length > 0) {
      logger.warn("Request validation failed", {
        url: req.url,
        method: req.method,
        errors,
      });

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
};

module.exports = validate;
