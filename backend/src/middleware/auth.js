const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'monone-secret');
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;