export const errorHandler = (err, req, res, _next) => {
  if (err.code === 11000) {
    err.message = 'El usuario ya existe';
    err.statusCode = 409;
  }
  res.status(err.statusCode || 500).json({ error: err.message });
};
