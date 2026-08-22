/**
 * Centralized error handler. Register LAST, after all routes:
 *   app.use(errorHandler);
 *
 * Controllers should either:
 *   - throw an Error (or a subclass with a `.status`), or
 *   - call next(err)
 * and let this middleware format the response, rather than
 * building res.status(...).json(...) error bodies inline everywhere.
 */

// Small helper controllers can throw: `throw new ApiError(404, 'Employee not found')`
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Duplicate key (e.g. email/employee_code already exists)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  // Foreign key violation (e.g. employee_id doesn't exist)
  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
}

export { errorHandler, ApiError };