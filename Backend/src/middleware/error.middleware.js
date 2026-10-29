
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") err.status = 413;
  if (err.code === "LIMIT_UNEXPECTED_FILE") err.status = 400;
  const duplicateKey = err.code === "ER_DUP_ENTRY";
  const status = err.status || (duplicateKey ? 409 : 500);

  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Internal server error"
        : duplicateKey
          ? "This email or license number is already registered"
          : err.message || "Request failed",
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};
