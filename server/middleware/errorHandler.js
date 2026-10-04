// Centralised error handler so every route returns errors in the same shape.
// Any controller can just: return next(err), or throw inside an async wrapper.
function errorHandler(err, req, res, next) {
  console.error(err); // full detail in the server log for debugging

  // Mongoose validation errors -> 400 with a readable message
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Duplicate key (e.g. email already exists) -> 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `${field} already in use` });
  }

  // Invalid ObjectId in a route param -> 400 instead of a scary 500
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server error" });
}

// Wraps an async route handler so thrown errors reach errorHandler
// instead of crashing the process. Usage: router.get("/", asyncHandler(fn))
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };