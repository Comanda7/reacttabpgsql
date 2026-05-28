# Лабораторная работа: React + Node.js + PostgreSQL

---

## Содержание

- [Описание задания](#-описание-задания)
- [Технологии](#-технологии)
- [Структура проекта](#-структура-проекта)
- [Шаг 1 — Установка PostgreSQL](#шаг-1--установка-postgresql)
- [Шаг 2 — Создание базы данных](#шаг-2--создание-базы-данных)
- [Шаг 3 — Настройка Backend (Node.js)](#шаг-3--настройка-backend-nodejs)
- [Шаг 4 — Настройка Frontend (React)](#шаг-4--настройка-frontend-react)
- [Шаг 5 — Запуск проекта](#шаг-5--запуск-проекта)
- [Описание страниц](#-описание-страниц)
- [API Reference](#-api-reference)
- [Как работает авторизация](#-как-работает-авторизация)
- [Тестовые данные](#-тестовые-данные)
- [Лабораторные работы: разбор проекта](#лабораторные-работы-разбор-проекта)
  - [Лаб. 1 — Структура проекта и настройка окружения](#лабораторная-работа--1-структура-проекта-и-настройка-окружения)
  - [Лаб. 2 — База данных PostgreSQL](#лабораторная-работа--2-база-данных-postgresql)
  - [Лаб. 3 — Backend на Express.js](#лабораторная-работа--3-backend--сервер-на-expressjs)
  - [Лаб. 4 — Frontend на React](#лабораторная-работа--4-frontend--react-приложение)
  - [Лаб. 5 — Ролевая модель доступа](#лабораторная-работа--5-ролевая-модель-доступа)
  - [Лаб. 6 — Форматирование данных](#лабораторная-работа--6-форматирование-данных-на-фронтенде)
  - [Итоговая архитектурная схема](#итоговая-архитектурная-схема)

---

## Описание задания

Приложение демонстрирует работу с реляционной базой данных через REST API:

| Страница | Описание |
|----------|----------|
| **Страница 1** | Таблица товаров (по возрастанию ID) + таблица пользователей (только для admin) |
| **Страница 2** | Карточки товаров с изображениями |
| **Страница 3** | Таблица товаров в обратном порядке (от последней записи) |
| **Админ-панель** | Таблица всех пользователей (доступно только admin) |

Реализованы:
- Регистрация нового пользователя
- Авторизация (вход) с JWT-токеном
- Выход из сессии
- Защищённые маршруты (роли `user` и `admin`)
- Хранение данных в PostgreSQL

---

## Технологии

### Backend
| Пакет | Назначение |
|-------|-----------|
| `express` | Веб-сервер, маршрутизация |
| `pg` | Драйвер PostgreSQL для Node.js |
| `bcryptjs` | Хеширование паролей |
| `jsonwebtoken` | Генерация и проверка JWT-токенов |
| `cors` | Разрешение запросов с фронтенда |
| `dotenv` | Переменные окружения из файла `.env` |

### Frontend
| Пакет | Назначение |
|-------|-----------|
| `react` | UI-библиотека |
| `react-router-dom` | Клиентская маршрутизация (SPA) |
| `Context API` | Глобальное состояние авторизации |
| `fetch` | HTTP-запросы к серверу |

---

## Структура проекта

```
lab-react-pgsql/
│
├── backend/                    # Node.js сервер
│   ├── src/
│   │   ├── index.js            # Точка входа, запуск Express
│   │   ├── db.js               # Подключение к PostgreSQL (Pool)
│   │   ├── middleware.js       # JWT-проверка, проверка роли admin
│   │   ├── init.sql            # SQL: создание таблиц + тестовые данные
│   │   └── routes/
│   │       ├── auth.js         # POST /api/auth/login, /register
│   │       ├── products.js     # GET /api/products, /products/reversed
│   │       └── users.js        # GET /api/users (только admin)
│   ├── .env.example            # Пример переменных окружения
│   └── package.json
│
└── frontend/                   # React приложение
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js              # Роутинг всего приложения
    │   ├── App.css             # Глобальные стили
    │   ├── index.js            # Точка входа React
    │   ├── context/
    │   │   └── AuthContext.js  # Контекст авторизации (user, token)
    │   ├── services/
    │   │   └── api.js          # Все HTTP-запросы к серверу
    │   ├── components/
    │   │   ├── Navbar.js       # Навигационная панель
    │   │   └── PrivateRoute.js # Защита маршрутов
    │   └── pages/
    │       ├── LoginPage.js    # Вход / Регистрация
    │       ├── Page1.js        # Таблица товаров + таблица пользователей
    │       ├── Page2.js        # Карточки товаров
    │       ├── Page3.js        # Обратный порядок товаров
    │       └── AdminPage.js    # Панель администратора
    └── package.json
```

---

## Шаг 1 — Установка PostgreSQL

### Windows

1. Скачайте установщик с сайта: https://www.postgresql.org/download/windows/
2. Запустите установщик, выберите компоненты: **PostgreSQL Server**, **pgAdmin 4**, **Command Line Tools**
3. Установите пароль для пользователя `postgres` (запомните его!)
4. Порт оставьте по умолчанию: **5432**

### macOS (через Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Шаг 2 — Создание базы данных

### Через pgAdmin 4 (графический интерфейс)

1. Откройте **pgAdmin 4**
2. Разверните дерево: Servers → PostgreSQL → правой кнопкой на **Databases** → **Create → Database**
3. В поле **Database** введите: `lab_db`
4. Нажмите **Save**
5. Разверните `lab_db` → правой кнопкой → **Query Tool**
6. Откройте файл `backend/src/init.sql` и выполните его (F5)

### Через командную строку

```bash
# Войти в PostgreSQL
psql -U postgres

# Создать базу данных
CREATE DATABASE lab_db;

# Подключиться к ней
\c lab_db

# Выполнить SQL-скрипт (укажите полный путь к файлу)
\i /полный/путь/до/backend/src/init.sql

# Выйти
\q
```

### Проверка данных

```sql
-- Должны вывестись 4 пользователя
SELECT id, username, email, role FROM users;

-- Должны вывестись 8 товаров
SELECT id, name, price FROM products;
```

---

## Шаг 3 — Настройка Backend (Node.js)

### Предварительные требования

- Node.js версии **18+**: https://nodejs.org/
- Проверка установки: `node -v` и `npm -v`

### Установка

```bash
cd backend
npm install
```

### Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте файл `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_db
DB_USER=postgres
DB_PASSWORD=ВАШ_ПАРОЛЬ_ОТ_POSTGRESQL
JWT_SECRET=любая_длинная_случайная_строка_для_подписи_токенов
```

### Запуск сервера

```bash
# Для разработки (автоперезапуск при изменениях)
npm run dev

# Для продакшена
npm start
```

Вывод при успешном запуске:
```
🚀 Сервер запущен на http://localhost:5000
✅ Подключение к PostgreSQL установлено
```

### Проверка сервера

Откройте в браузере: http://localhost:5000/api/health

Ответ должен быть:
```json
{ "status": "ok", "message": "Сервер работает" }
```

---

## Шаг 4 — Настройка Frontend (React)

```bash
# В новом терминале
cd frontend
npm install
npm start
```

Браузер автоматически откроет http://localhost:3000

> **Важно:** В `package.json` прописан `"proxy": "http://localhost:5000"` — это перенаправляет все запросы `/api/*` на бэкенд автоматически при разработке.

---

## Шаг 5 — Запуск проекта

Вам нужны **два открытых терминала**:

| Терминал | Команда | Адрес |
|----------|---------|-------|
| 1 — Backend | `cd backend && npm run dev` | http://localhost:5000 |
| 2 — Frontend | `cd frontend && npm start` | http://localhost:3000 |

---

## Описание страниц

### Страница входа `/login`

- Переключение между **Входом** и **Регистрацией** по кнопке
- При успешной авторизации токен и данные пользователя сохраняются в `localStorage`
- Перенаправление на `/page1`

### Страница 1 `/page1` — Таблица

- Таблица товаров из БД, отсортированная по `id ASC`
- Если пользователь — **admin**, дополнительно отображается таблица всех пользователей

### Страница 2 `/page2` — Карточки

- Те же данные товаров, оформленные в виде карточек с изображением, категорией, описанием и ценой

### Страница 3 `/page3` — Обратный порядок

- Товары в обратном порядке (`ORDER BY id DESC`)
- Показывает SQL-запрос, который использовался для получения данных

### Админ-панель `/admin`

- Доступна только пользователям с ролью `admin`
- Защита на двух уровнях: фронтенд (PrivateRoute) и бэкенд (middleware)

---

## API Reference

### Авторизация

| Метод | Маршрут | Тело запроса | Описание |
|-------|---------|-------------|----------|
| POST | `/api/auth/register` | `{ username, email, password }` | Регистрация |
| POST | `/api/auth/login` | `{ email, password }` | Вход |

**Пример запроса (login):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Товары (требуется токен)

| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET | `/api/products` | Все товары по возрастанию ID |
| GET | `/api/products/reversed` | Все товары по убыванию ID |
| GET | `/api/products/:id` | Один товар по ID |

**Пример с токеном:**
```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer ВАШ_JWT_ТОКЕН"
```

### Пользователи (только admin)

| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET | `/api/users` | Все пользователи (только для admin) |
| GET | `/api/users/me` | Данные текущего пользователя |

---

## Как работает авторизация

```
Пользователь вводит email + пароль
        │
        ▼
Frontend отправляет POST /api/auth/login
        │
        ▼
Backend проверяет email в таблице users
        │
        ▼
bcryptjs сравнивает пароль с хешем в БД
        │
        ▼
jsonwebtoken создаёт JWT-токен (живёт 24 часа)
        │
        ▼
Frontend получает токен → сохраняет в localStorage
        │
        ▼
Каждый последующий запрос: Header: Authorization: Bearer <token>
        │
        ▼
Middleware на сервере проверяет токен → пропускает или возвращает 401/403
```

### JWT-токен содержит:
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1716000000,
  "exp": 1716086400
}
```

### Выход из сессии
При нажатии кнопки «Выйти» фронтенд удаляет `token` и `user` из `localStorage`. Сервер не хранит токены — это **stateless** авторизация.

---

## Тестовые данные

| Пользователь | Email | Пароль | Роль |
|-------------|-------|--------|------|
| admin | admin@example.com | password | admin |
| ivan | ivan@example.com | password | user |
| maria | maria@example.com | password | user |
| petr | petr@example.com | password | user |

---

## Частые ошибки

### `ECONNREFUSED` при запуске backend
> PostgreSQL не запущен. Проверьте: `sudo systemctl status postgresql` (Linux) или через pgAdmin (Windows).

### `Пользователь с таким email уже существует`
> Тестовые данные из `init.sql` уже добавлены. При регистрации используйте другой email.

### Белый экран на фронтенде
> Откройте консоль браузера (F12). Скорее всего backend не запущен или неправильный порт в `.env`.

### `Токен не предоставлен` / `Недействительный токен`
> Токен истёк (живёт 24 часа) — выйдите и войдите снова.

---

## Дополнительные материалы

- [Документация PostgreSQL](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/ru/guide/routing.html)
- [React Router v6](https://reactrouter.com/en/main)
- [JWT.io — Отладка токенов](https://jwt.io/)
- [bcrypt — Хеширование паролей](https://github.com/dcodeIO/bcrypt.js)

---

---

# Лабораторные работы: разбор проекта

Ниже — подробный разбор каждого технического решения, применённого в этом проекте. Каждая лабораторная работа объясняет **что сделано**, **как сделано** и **почему именно так**.

---

## Лабораторная работа № 1. Структура проекта и настройка окружения

### Цель
Познакомиться с архитектурой Full-Stack приложения, понять разделение на клиентскую и серверную части.

### Зачем такое разделение?

Разделение на `backend` и `frontend` — стандартная практика в современной веб-разработке:
- **Backend** отвечает за бизнес-логику, безопасность и работу с данными. Он не знает, как данные будут отображаться.
- **Frontend** отвечает только за интерфейс и отображение. Он получает готовые данные через API.
- Такой подход позволяет в будущем заменить интерфейс (например, сделать мобильное приложение) без изменения серверной части.

### Настройка переменных окружения

Файл `backend/.env.example` показывает, какие переменные нужны серверу:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lab_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key_change_this
```

**Почему используются переменные окружения?**
Чтобы не хранить пароли и секретные ключи прямо в коде. Файл `.env` не попадает в Git-репозиторий (он добавлен в `.gitignore`). На разных серверах (разработка, тест, продакшн) будут разные значения.

---

## Лабораторная работа № 2. База данных PostgreSQL

### Цель
Создать схему базы данных, заполнить её тестовыми данными, понять типы данных и ограничения.

### Создание таблицы пользователей

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Разбор каждого поля:**

| Поле | Тип | Зачем |
|------|-----|-------|
| `id` | `SERIAL PRIMARY KEY` | Автоматически увеличивающийся уникальный идентификатор |
| `username` | `VARCHAR(50) UNIQUE NOT NULL` | Имя пользователя — максимум 50 символов, не может повторяться и быть пустым |
| `email` | `VARCHAR(100) UNIQUE NOT NULL` | Email — уникальный идентификатор для входа |
| `password_hash` | `VARCHAR(255) NOT NULL` | Хранится не пароль, а его bcrypt-хэш |
| `role` | `VARCHAR(20) DEFAULT 'user' CHECK (...)` | Роль по умолчанию — 'user'; ограничение `CHECK` запрещает любые другие значения кроме 'user' и 'admin' |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | Дата регистрации ставится автоматически |

### Создание таблицы товаров

```sql
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ключевые моменты:**
- `DECIMAL(10, 2)` — для денег: 10 цифр всего, 2 после запятой. Нельзя использовать `FLOAT`, так как числа с плавающей точкой дают погрешности при финансовых расчётах.
- `TEXT` — для длинных описаний без ограничения длины.
- `INTEGER DEFAULT 0` — остаток на складе, по умолчанию 0.

### Тестовые данные

```sql
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2a$10$...', 'admin'),
('ivan', 'ivan@example.com', '$2a$10$...', 'user')
ON CONFLICT DO NOTHING;
```

**Почему в базе хранится хэш, а не пароль?**
Хэш — это результат необратимой функции. Даже если злоумышленник получит доступ к базе данных, он не сможет узнать исходный пароль. Строка `$2a$10$...` — это bcrypt-хэш пароля `password`.

`ON CONFLICT DO NOTHING` — если запись уже существует (при повторном запуске скрипта), вставка игнорируется, а не падает с ошибкой.

### SQL-запросы, используемые в приложении

```sql
-- Получить все товары от первого к последнему (Page1)
SELECT * FROM products ORDER BY id ASC;

-- Получить товары в обратном порядке (Page3)
SELECT * FROM products ORDER BY id DESC;

-- Получить один товар по ID
SELECT * FROM products WHERE id = $1;

-- Получить всех пользователей без пароля (AdminPage)
SELECT id, username, email, role, created_at FROM users ORDER BY id ASC;
```

**Почему в запросах для пользователей нет поля `password_hash`?**
Никогда не нужно передавать хэш пароля на клиент — это лишний риск утечки данных. В запросе явно перечислены только нужные поля.

---

## Лабораторная работа № 3. Backend — сервер на Express.js

### Цель
Создать REST API сервер с подключением к PostgreSQL, настроить маршруты и middleware.

### 3.1. Подключение к базе данных (`db.js`)

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'lab_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

pool.on('connect', () => {
    console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
    console.error('❌ Ошибка пула PostgreSQL:', err);
    process.exit(-1);
});

module.exports = pool;
```

**Зачем Pool, а не одно соединение?**
`Pool` (пул соединений) держит несколько открытых соединений с базой данных одновременно. Когда приходит запрос, он берёт свободное соединение из пула, а не открывает новое — это быстрее. Когда запрос завершается, соединение возвращается в пул.

**`process.exit(-1)`** — если пул не может подключиться к базе, нет смысла продолжать работу сервера. Код `-1` означает аварийное завершение.

### 3.2. Точка входа сервера (`index.js`)

```javascript
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// 404 для неизвестных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: `Маршрут ${req.method} ${req.url} не найден` });
});

// Глобальный обработчик ошибок (4 параметра — обязательно!)
app.use((err, req, res, next) => {
    console.error('Необработанная ошибка:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});
```

**Почему `cors` настроен только на `localhost:3000`?**
CORS (Cross-Origin Resource Sharing) — механизм безопасности браузера. Указав `origin: 'http://localhost:3000'`, мы разрешаем запросы только с нашего React-приложения и блокируем все остальные источники.

**`express.json()`** — без этого middleware Express не умеет читать тело запроса в формате JSON. Все `POST`-запросы с телом были бы пустыми.

**Порядок middleware важен!** Глобальный обработчик ошибок (4 параметра: `err, req, res, next`) должен быть последним — иначе Express не распознает его как обработчик ошибок.

### 3.3. Аутентификация (`routes/auth.js`)

#### Регистрация

```javascript
router.post('/register', async (req, res) => {
    // Валидация
    if (!username || !email || !password)
        return res.status(400).json({ error: 'Все поля обязательны' });

    // Проверка на дубликат
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );
    if (existing.rows.length > 0)
        return res.status(409).json({ error: 'Пользователь уже существует' });

    // Хеширование пароля
    const password_hash = await bcrypt.hash(password, 10);

    // Сохранение с возвратом данных
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role',
        [username, email, password_hash]
    );

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
});
```

**Почему `$1, $2, $3` вместо строкового шаблона?**
Это параметризованные запросы — защита от SQL-инъекций. Если пользователь введёт `'; DROP TABLE users; --`, драйвер `pg` не выполнит это как SQL-код, а передаст как обычную строку.

**`saltRounds = 10`** — bcrypt применяет хэш-функцию 2¹⁰ = 1024 раза подряд. Это делает перебор паролей медленным: даже мощный компьютер проверяет всего несколько сотен вариантов в секунду.

**`RETURNING id, username, email, role`** — PostgreSQL может вернуть вставленные данные сразу, без второго запроса `SELECT`.

#### Вход

```javascript
router.post('/login', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', [email]
    );

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
        return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, user: { id, username, email, role } });
});
```

**Почему одинаковое сообщение об ошибке для неверного email и пароля?**
Если бы мы отдельно сообщали «email не найден» и «неверный пароль», злоумышленник мог бы узнать, какие email-адреса зарегистрированы в системе. Одинаковое сообщение не даёт такой информации.

### 3.4. Middleware для защиты маршрутов (`middleware.js`)

```javascript
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"

    if (!token)
        return res.status(401).json({ error: 'Токен не предоставлен' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Прикрепляем данные пользователя к запросу
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin')
        return res.status(403).json({ error: 'Доступ запрещён: требуются права администратора' });
    next();
};
```

**Схема работы middleware:**

```
Запрос → authMiddleware → [adminMiddleware] → обработчик маршрута → ответ
```

**`next()`** — вызов следующего middleware в цепочке. Если не вызвать `next()`, запрос «зависнет» и ответ никогда не придёт.

**`req.user = decoded`** — данные пользователя прикрепляются к запросу, чтобы последующие обработчики могли использовать `req.user.id` или `req.user.role` без повторных запросов к базе.

**Разница между 401 и 403:**
- `401 Unauthorized` — токен отсутствует (нужно войти)
- `403 Forbidden` — токен есть, но прав недостаточно

### 3.5. Применение middleware в маршрутах

```javascript
// Любой авторизованный пользователь
router.get('/products', authMiddleware, async (req, res) => { ... });

// Только администратор
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => { ... });
```

Middleware передаются как аргументы в `router.get()`. Express вызывает их последовательно слева направо.

---

## Лабораторная работа № 4. Frontend — React-приложение

### Цель
Создать React-приложение с маршрутизацией, глобальным состоянием и HTTP-запросами к API.

### 4.1. Глобальное состояние авторизации — Context API (`AuthContext.js`)

```javascript
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Восстановить сессию из localStorage при загрузке страницы
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) setUser(JSON.parse(savedUser));
        setLoading(false);
    }, []); // [] — только один раз при монтировании

    const saveAuth = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
    return context;
};
```

**Зачем Context API, а не передача props?**
Без контекста данные пользователя пришлось бы передавать через props из `App.js` → `Navbar.js` → `Page1.js` и т.д. Это называется «prop drilling» и затрудняет поддержку кода. Context позволяет любому компоненту получить данные напрямую.

**Зачем `localStorage`?**
Состояние React сбрасывается при перезагрузке страницы. `localStorage` сохраняет токен на диске браузера — сессия восстанавливается автоматически.

**`loading = true` в начале** — пока идёт проверка `localStorage`, приложение показывает «Загрузка...» вместо того, чтобы мигнуть на страницу входа.

### 4.2. Слой HTTP-запросов (`services/api.js`)

```javascript
const BASE_URL = '/api';

const request = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Ошибка запроса');

    return data;
};

export const login = (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getProducts = () => request('/products');
export const getProductsReversed = () => request('/products/reversed');
export const getUsers = () => request('/users');
```

**Зачем выносить запросы в отдельный файл?**
Если изменится адрес API — меняем только `api.js`. Принцип DRY (Don't Repeat Yourself).

**`if (!response.ok) throw new Error(...)`** — `fetch` не выбрасывает ошибку при HTTP-статусах 4xx/5xx (только при сетевых сбоях). Нужно проверять `response.ok` самостоятельно.

**`BASE_URL = '/api'` (без хоста)** — в `package.json` прописан `"proxy": "http://localhost:5000"`. В режиме разработки все запросы `/api/...` автоматически проксируются на сервер.

### 4.3. Маршрутизация (`App.js`)

```javascript
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/page1"
                        element={<PrivateRoute><Page1 /></PrivateRoute>}
                    />
                    <Route path="/admin"
                        element={<PrivateRoute adminOnly={true}><AdminPage /></PrivateRoute>}
                    />

                    <Route path="/" element={<Navigate to="/page1" replace />} />
                    <Route path="*" element={<Navigate to="/page1" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
```

**`AuthProvider` стоит снаружи `BrowserRouter`** — потому что `PrivateRoute` использует `useAuth()`. Если порядок изменить, компоненты не получат доступ к контексту авторизации.

**`replace` в `<Navigate>`** — заменяет запись в истории браузера вместо добавления новой, чтобы кнопка «Назад» работала корректно.

**`path="*"`** — маршрут-«ловушка» для всех неизвестных URL (аналог страницы 404).

### 4.4. Защита маршрутов (`PrivateRoute.js`)

```javascript
const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/page1" replace />;

    return children;
};
```

**Три уровня проверки:**
1. Загрузка данных из `localStorage` — показываем индикатор
2. Пользователь не авторизован — перенаправляем на `/login`
3. Требуется роль `admin`, но у пользователя её нет — перенаправляем на `/page1`

Это защита на уровне клиента. Серверная защита через `adminMiddleware` обязательна дополнительно: клиентский код можно обойти через DevTools браузера.

### 4.5. Навигация (`Navbar.js`)

```javascript
const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <NavLink to="/page1"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
                Страница 1 — Таблица
            </NavLink>

            {user?.role === 'admin' && (
                <NavLink to="/admin">👑 Админ-панель</NavLink>
            )}

            <button onClick={() => { logout(); navigate('/login'); }}>
                Выйти
            </button>
        </nav>
    );
};
```

**`NavLink` vs `Link`:** `NavLink` автоматически добавляет класс `active` через коллбэк `({ isActive }) => ...`. `Link` — просто ссылка без этой функции.

**`user?.role`** — опциональная цепочка. Если `user` равен `null`, вместо ошибки вернётся `undefined`. Позволяет не писать `user && user.role === 'admin'`.

### 4.6. Страница входа (`LoginPage.js`)

```javascript
const handleSubmit = async (e) => {
    e.preventDefault(); // Не перезагружать страницу
    setLoading(true);
    try {
        const result = isLogin
            ? await login(formData.email, formData.password)
            : await register(formData.username, formData.email, formData.password);

        saveAuth(result.token, result.user);
        navigate('/page1');
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false); // Всегда снимаем блокировку кнопки
    }
};
```

**Один компонент — две формы:** переменная `isLogin` переключает режимы входа и регистрации без создания двух отдельных компонентов.

**`e.preventDefault()`** — без этого браузер перезагрузит страницу при отправке формы, что сбросит всё состояние React.

**`finally { setLoading(false) }`** — выполняется всегда: и при успехе, и при ошибке. Если не снять блокировку кнопки при ошибке, пользователь не сможет попробовать снова.

**`[e.target.name]: e.target.value`** — динамический ключ. Один обработчик `handleChange` работает для всех полей формы, потому что `name` каждого `<input>` совпадает с ключом в `formData`.

### 4.7. Паттерн загрузки данных

Одинаков во всех трёх страницах:

```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    getProducts()
        .then(setProducts)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
}, []); // Запрос выполняется один раз при монтировании компонента
```

**Три состояния загрузки — всегда обрабатывать все три:**
```jsx
{loading && <div className="loading">Загрузка...</div>}
{error && <div className="error-msg">{error}</div>}
{!loading && !error && <table>...</table>}
```

### 4.8. Различные представления одних данных

| Страница | SQL | Отображение |
|----------|-----|-------------|
| Page 1 | `ORDER BY id ASC` | `<table>` с колонками |
| Page 2 | `ORDER BY id ASC` | CSS Grid с карточками и фото |
| Page 3 | `ORDER BY id DESC` | `<table>` + показывает SQL-запрос на странице |

Page 3 показывает два столбца: `index + 1` (порядковый номер в выборке) и `p.id` (реальный ID в БД) — наглядно демонстрирует разницу между порядком данных и их идентификаторами.

---

## Лабораторная работа № 5. Ролевая модель доступа

### Цель
Реализовать разграничение прав между обычным пользователем и администратором.

### Схема ролевого доступа

```
┌─────────────────────────────────────────────────────────┐
│                    Маршруты и права                      │
├──────────────────────────┬──────────────────────────────┤
│  Маршрут                 │  Кто имеет доступ            │
├──────────────────────────┼──────────────────────────────┤
│  /login                  │  Все (публичный)             │
│  /page1, /page2, /page3  │  Любой авторизованный        │
│  /admin                  │  Только role = 'admin'       │
├──────────────────────────┼──────────────────────────────┤
│  GET /api/products       │  Любой с JWT-токеном         │
│  GET /api/users          │  Только role = 'admin'       │
└──────────────────────────┴──────────────────────────────┘
```

### Защита реализована на двух уровнях

**Уровень 1 — Frontend (UX-защита):**
- `PrivateRoute adminOnly={true}` перенаправляет обычных пользователей
- В `Navbar` ссылка на `/admin` видна только администратору

**Уровень 2 — Backend (реальная защита):**
- `authMiddleware` — проверяет наличие и валидность JWT
- `adminMiddleware` — проверяет поле `role` внутри токена

**Почему нельзя ограничиться только фронтендом?**
Клиентский код выполняется в браузере, который пользователь полностью контролирует. Через DevTools, curl или Postman можно отправить запрос напрямую к API, минуя весь React-код. Поэтому проверка прав **обязательно** должна быть на сервере.

### Данные внутри JWT-токена

```javascript
jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
)
```

Токен содержит роль пользователя. `adminMiddleware` читает её из `req.user.role`, не обращаясь к базе данных при каждом запросе — это быстро и не создаёт лишней нагрузки.

**Важно:** JWT подписан секретным ключом. Его содержимое можно прочитать (закодировано в Base64), но подделать нельзя — сервер проверяет подпись при каждом запросе.

---

## Лабораторная работа № 6. Форматирование данных на фронтенде

### Цель
Научиться правильно форматировать данные для отображения пользователю.

### Форматирование цены

```javascript
const formatPrice = (price) =>
    Number(price).toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    });
// Результат: "89 990 ₽"
```

`toLocaleString` — стандартный метод JavaScript. Расставляет разделители тысяч по правилам русского языка и добавляет символ валюты автоматически.

### Форматирование даты

```javascript
const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
// Результат: "21.05.2026"
```

PostgreSQL возвращает дату в формате ISO 8601 (`2026-05-21T06:21:00.000Z`). `new Date()` разбирает строку, а `toLocaleDateString` форматирует по-русски.

### Порядковый номер vs ID в базе (Page3)

```jsx
{products.map((p, index) => (
    <tr key={p.id}>
        <td>{index + 1}</td>   {/* Порядковый номер: 1, 2, 3... */}
        <td>#{p.id}</td>       {/* Реальный ID в БД: 8, 7, 6... */}
    </tr>
))}
```

Данные отсортированы `ORDER BY id DESC` — товар с ID=8 стоит первым, но его порядковый номер в таблице — 1. Два столбца наглядно объясняют эту разницу.

---

## Итоговая архитектурная схема

```
┌─────────────────────────────────────────────────────────────┐
│                    БРАУЗЕР (React)                           │
│                                                              │
│  AuthContext ──────── Хранит user + token                    │
│       │                                                      │
│  App.js (Router)                                             │
│       │                                                      │
│  PrivateRoute ─── Проверяет авторизацию и роль              │
│       │                                                      │
│  ┌────┴────┬─────────┬──────────┬──────────┐               │
│  LoginPage Page1    Page2     Page3    AdminPage            │
│       │      │                              │               │
│  services/api.js ─── Все HTTP-запросы                       │
│                                                              │
└─────────────────────────────┬───────────────────────────────┘
                              │  HTTP + Bearer Token
┌─────────────────────────────┼───────────────────────────────┐
│              СЕРВЕР (Express)                                │
│                             │                               │
│  authMiddleware ────── Проверяет JWT                        │
│  adminMiddleware ───── Проверяет роль                       │
│                             │                               │
│  /api/auth    /api/products    /api/users                   │
│                             │                               │
│                           db.js (Pool)                      │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              │
                        PostgreSQL
                       ┌───────────┐
                       │  users    │
                       │  products │
                       └───────────┘
```
