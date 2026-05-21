# 📦 Лабораторная работа: React + Node.js + PostgreSQL

> **Полноценное веб-приложение с авторизацией, ролями и тремя страницами отображения данных из PostgreSQL.**

---

## 📋 Содержание

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

---

## 📝 Описание задания

Приложение демонстрирует работу с реляционной базой данных через REST API:

| Страница | Описание |
|----------|----------|
| **Страница 1** | Таблица товаров (по возрастанию ID) + таблица пользователей (только для admin) |
| **Страница 2** | Карточки товаров с изображениями |
| **Страница 3** | Таблица товаров в обратном порядке (от последней записи) |
| **Админ-панель** | Таблица всех пользователей (доступно только admin) |

Реализованы:
- ✅ Регистрация нового пользователя
- ✅ Авторизация (вход) с JWT-токеном
- ✅ Выход из сессии
- ✅ Защищённые маршруты (роли `user` и `admin`)
- ✅ Хранение данных в PostgreSQL

---

## 🛠 Технологии

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

## 📁 Структура проекта

```
lab-react-pgsql/
│
├── backend/                    # Node.js сервер
│   ├── src/
│   │   ├── index.js            # Точка входа, запуск Express
│   │   ├── db.js               # Подключение к PostgreSQL (Pool)
│   │   ├── middleware.js        # JWT-проверка, проверка роли admin
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
# Войти в PostgreSQL (Windows: используйте psql из меню Пуск)
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
# Перейти в папку backend
cd backend

# Установить зависимости
npm install
```

### Настройка переменных окружения

```bash
# Скопировать пример файла
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

Вывод в терминале при успешном запуске:
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
# Перейти в папку frontend (в новом терминале!)
cd frontend

# Установить зависимости
npm install

# Запустить приложение
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

## 🖥 Описание страниц

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

## 🔌 API Reference

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

## 🔐 Как работает авторизация

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

## 🧪 Тестовые данные

| Пользователь | Email | Пароль | Роль |
|-------------|-------|--------|------|
| admin | admin@example.com | password | admin |
| ivan | ivan@example.com | password | user |
| maria | maria@example.com | password | user |
| petr | petr@example.com | password | user |

---

## ❓ Частые ошибки

### `ECONNREFUSED` при запуске backend
> PostgreSQL не запущен. Проверьте: `sudo systemctl status postgresql` (Linux) или через pgAdmin (Windows).

### `Пользователь с таким email уже существует`
> Тестовые данные из `init.sql` уже добавлены. При регистрации используйте другой email.

### Белый экран на фронтенде
> Откройте консоль браузера (F12). Скорее всего backend не запущен или неправильный порт в `.env`.

### `Токен не предоставлен` / `Недействительный токен`
> Токен истёк (живёт 24 часа) — выйдите и войдите снова.

---

## 📚 Дополнительные материалы

- [Документация PostgreSQL](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/ru/guide/routing.html)
- [React Router v6](https://reactrouter.com/en/main)
- [JWT.io — Отладка токенов](https://jwt.io/)
- [bcrypt — Хеширование паролей](https://github.com/dcodeIO/bcrypt.js)
```
frontend/
└── src/
    ├── components/
    │   ├── Navbar.css      ← стили навбара
    │   ├── Navbar.js       ← компонент навбара
    │   └── PrivateRoute.js ← защита маршрутов
    ├── context/
    │   └── AuthContext.js  ← глобальное состояние
    ├── pages/
    │   ├── AdminPage.js
    │   ├── LoginPage.js
    │   ├── Page1.js
    │   ├── Page2.js
    │   └── Page3.js
    ├── services/
    │   └── api.js          ← все запросы к серверу
    ├── App.css
    ├── App.js
    └── index.js
    