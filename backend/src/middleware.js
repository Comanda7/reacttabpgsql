const jwt = require('jsonwebtoken');

// Middleware: проверка JWT токена
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

// Middleware: проверка роли администратора
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён: требуются права администратора' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
