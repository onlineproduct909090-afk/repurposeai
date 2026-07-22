const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  const message = err.expose === false && status === 500
    ? 'Something went wrong. Please try again.'
    : err.message || 'Unexpected error';

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${status}`, {
      code,
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status}`, { code, message });
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = errorHandler;