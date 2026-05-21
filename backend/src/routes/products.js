const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// GET /api/products — Все товары (по возрастанию id)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения товаров:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/products/reversed — Все товары (по убыванию id — с последней записи)
router.get('/reversed', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения товаров:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/products/:id — Один товар
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
