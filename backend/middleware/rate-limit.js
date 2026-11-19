function createRateLimit({ windowMs, max }) {
  const clients = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of clients) if (value.resetAt <= now) clients.delete(key);
  }, Math.min(windowMs, 60_000));
  timer.unref();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = clients.get(key);
    if (!entry || entry.resetAt <= now) entry = { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    clients.set(key, entry);
    if (entry.count > max) return res.status(429).json({ error: res.locals.ui?.rate_limit_error || 'rate_limit' });
    next();
  };
}

module.exports = { createRateLimit };

