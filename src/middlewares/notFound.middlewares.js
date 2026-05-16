export const notFound = (req, res, next) => {
  const error = new Error('Rutas no encontrada');
  error.statusCode = 404;
  next(error);
};
