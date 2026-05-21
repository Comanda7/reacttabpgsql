const express = require('express');
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware');

const router = express.Router();

// GET /api/users — Все пользователи (только для админа)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/users/me — Текущий пользователь
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
