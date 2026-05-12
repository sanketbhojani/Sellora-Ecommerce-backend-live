// ============================
// Global Validation Middleware - validateMiddleware.js
// ============================
// Uses Joi schemas to validate incoming request body/params.
// If validation fails, it immediately sends a 400 Bad Request error.


const validate = (schema, property = "body") => {
  return (req, res, next) => {
    // Validate request based on schema
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove undefined/extra fields not in schema
    });

    if (error) {
      // Extract all error messages and join them beautifully
      const messages = error.details.map((detail) => detail.message).join(", ");
      return res.status(400).json({
                    sucess:false,
                    message:`Validation Failed: ${messages}`
                })
    }

    next();
  };
};

export default validate;
