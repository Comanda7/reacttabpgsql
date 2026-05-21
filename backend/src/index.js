const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ===== Маршруты =====
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health-check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает' });
});

// 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.url} не найден` });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📋 API документация:`);
  console.log(`   POST /api/auth/register  — Регистрация`);
  console.log(`   POST /api/auth/login     — Авторизация`);
  console.log(`   GET  /api/products       — Список товаров`);
  console.log(`   GET  /api/products/reversed — Товары в обратном порядке`);
  console.log(`   GET  /api/users          — Список пользователей (admin)`);
});
