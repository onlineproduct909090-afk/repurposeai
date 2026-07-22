function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      err.details = error.details.map(d => ({
        path: d.path.join('.'),
        message: d.message.replace(/\"/g, ''),
      }));
      return next(err);
    }

    req.body = value; // use the sanitized payload
    next();
  };
}

module.exports = validate;