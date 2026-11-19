function notFound(req, res) { res.status(404).json({ error: 'not_found' }); }

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error('[Café Altura]', error.message);
  res.status(error.status || 500).json({ error: error.publicMessage || 'server_error' });
}

module.exports = { notFound, errorHandler };

