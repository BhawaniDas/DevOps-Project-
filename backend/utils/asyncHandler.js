/**
 * Wraps an async Express handler to forward errors to the next() middleware.
 * Eliminates try/catch boilerplate in every controller function.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
