# Лабораторные работы: Full-Stack приложение на React + Node.js + PostgreSQL

## Обзор проекта

Проект представляет собой учебное веб-приложение с полноценной архитектурой «клиент–сервер–база данных». Пользователь входит в систему, получает JWT-токен и видит данные из PostgreSQL в трёх разных представлениях. Администратор имеет доступ к дополнительным возможностям.

**Стек технологий:**
- **Frontend:** React 18, React Router v6
- **Backend:** Node.js, Express.js
- **База данных:** PostgreSQL
- **Аутентификация:** JWT (JSON Web Token) + bcrypt

---

## Лабораторная работа № 1. Структура проекта и настройка окружения

### Цель
Познакомиться с архитектурой Full-Stack приложения, понять разделение на клиентскую и серверную части.

### Структура каталогов

```
reacttabpgsql-main/
├── backend/               ← Серверная часть (Node.js + Express)
│   ├── src/
│   │   ├── index.js       ← Точка входа сервера
│   │   ├── db.js          ← Подключение к PostgreSQL
│   │   ├── middleware.js  ← JWT-проверка и ролевой доступ
│   │   ├── init.sql       ← SQL-скрипт создания таблиц и данных
│   │   └── routes/
│   │       ├── auth.js    ← Регистрация и вход
│   │       ├── products.js ← Эндпоинты для товаров
│   │       └── users.js   ← Эндпоинты для пользователей
│   ├── .env.example       ← Шаблон переменных окружения
│   └── package.json
│
└── frontend/              ← Клиентская часть (React)
    └── src/
        ├── App.js         ← Корневой компонент, маршрутизация
        ├── context/
        │   └── AuthContext.js  ← Глобальное состояние авторизации
        ├── services/
        │   └── api.js     ← Все HTTP-запросы к серверу
        ├── components/
        │   ├── Navbar.js  ← Навигационная панель
        │   └── PrivateRoute.js ← Защита маршрутов
        └── pages/
            ├── LoginPage.js  ← Вход и регистрация
            ├── Page1.js      ← Таблица товаров
            ├── Page2.js      ← Карточки товаров
            ├── Page3.js      ← Таблица в обратном порядке
            └── AdminPage.js  ← Панель администратора
```

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
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('ivan', 'ivan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
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
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Health-check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

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
CORS (Cross-Origin Resource Sharing) — это механизм безопасности браузера. По умолчанию браузер не разрешает JavaScript-коду на одном домене обращаться к серверу на другом. Указав `origin: 'http://localhost:3000'`, мы разрешаем запросы только с нашего React-приложения и блокируем все остальные источники.

**`express.json()`** — без этого middleware Express не умеет читать тело запроса в формате JSON. Все `POST`-запросы с телом были бы пустыми.

**Порядок middleware важен!** Глобальный обработчик ошибок (4 параметра: `err, req, res, next`) должен быть последним — иначе Express не распознает его как обработчик ошибок.

### 3.3. Аутентификация (`routes/auth.js`)

#### Регистрация

```javascript
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Валидация входных данных
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    // Проверка на дубликат
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );
    if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Сохранение и возврат токена
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

**`saltRounds = 10`** — bcrypt применяет хэш-функцию 2^10 = 1024 раза подряд. Это делает перебор паролей медленным: даже мощный компьютер проверяет всего несколько сотен вариантов в секунду.

**`RETURNING id, username, email, role`** — PostgreSQL может вернуть вставленные данные сразу, без второго запроса `SELECT`.

#### Вход

```javascript
router.post('/login', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }

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

**`jwt.sign({ id, username, role }, secret, { expiresIn: '24h' })`** — создаёт JWT-токен. Внутри токена зашифрован объект с данными пользователя. Токен живёт 24 часа — после этого нужно снова войти.

### 3.4. Middleware для защиты маршрутов (`middleware.js`)

```javascript
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Добавляем данные пользователя в запрос
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён: требуются права администратора' });
    }
    next();
};
```

**Схема работы middleware:**

```
Запрос → authMiddleware → [adminMiddleware] → обработчик маршрута → ответ
```

**`next()`** — вызов следующего middleware или обработчика в цепочке. Если не вызвать `next()`, запрос «зависнет» и ответ никогда не придёт.

**`req.user = decoded`** — после проверки токена данные пользователя прикрепляются к объекту запроса. Последующие обработчики могут использовать `req.user.id` или `req.user.role` без повторных запросов к базе.

**Разница между 401 и 403:**
- `401 Unauthorized` — токен отсутствует (нужно войти)
- `403 Forbidden` — токен есть, но прав недостаточно (нельзя даже с авторизацией)

### 3.5. Применение middleware в маршрутах

```javascript
// products.js — любой авторизованный пользователь
router.get('/', authMiddleware, async (req, res) => { ... });

// users.js — только администратор
router.get('/', authMiddleware, adminMiddleware, async (req, res) => { ... });
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
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []); // [] означает "только один раз при монтировании"

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
```

**Зачем Context API, а не передача props?**
Без контекста данные пользователя (`user`) пришлось бы передавать через props из `App.js` → `Navbar.js`, из `App.js` → `Page1.js` и так далее. Это называется «prop drilling» и затрудняет поддержку кода. Context позволяет любому компоненту получить данные напрямую.

**Зачем `localStorage`?**
Состояние React сбрасывается при перезагрузке страницы. `localStorage` сохраняет токен и данные пользователя на диске браузера — сессия восстанавливается автоматически.

**`loading = true` в начале** — пока идёт проверка `localStorage`, приложение показывает «Загрузка...» вместо того, чтобы мигнуть на страницу входа.

**Кастомный хук `useAuth()`:**
```javascript
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};
```

Без проверки на `null` можно случайно использовать `useAuth()` вне `AuthProvider` — это трудно отлаживаемая ошибка. Явное исключение сразу указывает на проблему.

### 4.2. Слой HTTP-запросов (`services/api.js`)

```javascript
const BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

const request = async (url, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса');
    }

    return data;
};

export const login = (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getProducts = () => request('/products');
export const getProductsReversed = () => request('/products/reversed');
export const getUsers = () => request('/users');
```

**Зачем выносить запросы в отдельный файл?**
Если завтра изменится адрес API или нужно добавить логирование — меняем только `api.js`, а не каждый компонент. Принцип DRY (Don't Repeat Yourself).

**`Authorization: Bearer ${token}`** — стандартный формат передачи JWT. Сервер в `authMiddleware` делает `authHeader.split(' ')[1]` чтобы отделить слово «Bearer» от самого токена.

**`if (!response.ok) throw new Error(...)`** — `fetch` не выбрасывает ошибку при HTTP-статусах 4xx/5xx (только при сетевых сбоях). Нужно проверять `response.ok` самостоятельно.

**`BASE_URL = '/api'` (без хоста)** — React-приложение настроено в `package.json` с `"proxy": "http://localhost:5000"`. В режиме разработки все запросы `/api/...` автоматически проксируются на сервер. Это позволяет не думать о CORS при разработке.

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

**Порядок оборачивания провайдеров имеет значение:**
`AuthProvider` стоит снаружи `BrowserRouter`, потому что `PrivateRoute` использует `useAuth()` — если бы `BrowserRouter` был снаружи, а `AuthProvider` внутри, часть компонентов могла бы не иметь доступа к контексту авторизации.

**`replace` в `<Navigate>`** — заменяет текущую запись в истории браузера вместо добавления новой. Так пользователь не может нажать «Назад» и попасть на несуществующий маршрут.

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
1. Ещё идёт загрузка данных из `localStorage` — показываем индикатор
2. Пользователь не авторизован — перенаправляем на `/login`
3. Требуется роль `admin`, но у пользователя её нет — перенаправляем на `/page1`

Это защита на уровне клиента. Серверная защита через `adminMiddleware` — обязательна в дополнение: клиентский код можно обойти через DevTools браузера.

### 4.5. Навигация (`Navbar.js`)

```javascript
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <NavLink to="/page1"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
                Страница 1 — Таблица
            </NavLink>

            {/* Ссылка на админку — только для admin */}
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

**`NavLink` vs `Link`:**
`NavLink` автоматически добавляет класс `active` к текущему активному маршруту через коллбэк `({ isActive }) => ...`. `Link` — просто ссылка без этой функции.

**`user?.role`** — опциональная цепочка. Если `user` равен `null` (не авторизован), вместо ошибки вернётся `undefined`. Это позволяет не писать `user && user.role === 'admin'`.

### 4.6. Страница входа (`LoginPage.js`)

```javascript
const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true); // true = вход, false = регистрация
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Сбрасываем ошибку при вводе
    };

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
};
```

**Один компонент — две формы:**
Переменная `isLogin` переключает между режимами входа и регистрации. Это экономит код: не нужно создавать два отдельных компонента с похожей логикой.

**`e.preventDefault()`** — без этого браузер перезагрузит страницу при отправке формы (поведение по умолчанию для `<form>`), что сбросит всё состояние React.

**`finally { setLoading(false) }`** — `finally` выполняется всегда: и при успехе, и при ошибке. Если не снять блокировку кнопки в случае ошибки, пользователь не сможет попробовать снова.

**`[e.target.name]: e.target.value`** — динамический ключ объекта. Один обработчик `handleChange` работает для всех полей формы, потому что `name` у каждого `<input>` совпадает с ключом в `formData`.

### 4.7. Загрузка данных в компонентах

Паттерн загрузки данных одинаков во всех трёх страницах (`Page1`, `Page2`, `Page3`):

```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    getProducts()
        .then(setProducts)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
}, []); // [] — запрос выполняется один раз при монтировании компонента
```

**Три состояния загрузки:**
```jsx
{loading && <div className="loading">Загрузка...</div>}
{error && <div className="error-msg">{error}</div>}
{!loading && !error && <table>...</table>}
```

Всегда нужно обрабатывать все три состояния: загрузка, ошибка, данные. Иначе пользователь не будет понимать, что происходит.

### 4.8. Различные представления одних данных

Одни и те же данные из PostgreSQL отображаются по-разному:

**Page 1 — таблица с сортировкой ASC:**
```sql
SELECT * FROM products ORDER BY id ASC
```
Отображает данные как `<table>` с колонками: ID, Название, Категория, Цена, Склад, Дата.

**Page 2 — карточки:**
```jsx
<div className="cards-grid">
    {products.map((p) => (
        <div className="product-card" key={p.id}>
            <img src={p.image_url} alt={p.name} />
            <div className="card-body">...</div>
        </div>
    ))}
</div>
```
Те же данные, но в виде CSS Grid с карточками и изображениями.

**Page 3 — таблица с сортировкой DESC + показывает SQL:**
```sql
SELECT * FROM products ORDER BY id DESC
```
Два столбца для порядкового номера: `index + 1` (позиция в текущей выборке) и `p.id` (реальный ID в БД). Это наглядно показывает разницу между порядком данных и их идентификаторами.

**Page 3 также показывает SQL-запрос прямо на странице** — педагогический приём, помогающий студентам видеть связь между кодом и результатом.

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
- `PrivateRoute` с `adminOnly={true}` перенаправляет обычных пользователей
- В `Navbar` ссылка на `/admin` видна только администратору

**Уровень 2 — Backend (реальная защита):**
- `authMiddleware` — проверяет наличие и валидность JWT
- `adminMiddleware` — проверяет поле `role` внутри токена

```javascript
// Только admin может получить список пользователей
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
});
```

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

**Важно:** JWT подписан секретным ключом. Его содержимое можно прочитать (оно закодировано в Base64, но не зашифровано), но подделать нельзя — сервер проверяет подпись при каждом запросе.

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

`toLocaleString` — стандартный метод JavaScript для локализованного форматирования. Он сам расставит разделители тысяч по правилам русского языка и добавит символ валюты.

### Форматирование даты

```javascript
const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
// Результат: "21.05.2026"
```

PostgreSQL возвращает дату в формате ISO 8601 (`2026-05-21T06:21:00.000Z`). `new Date()` разбирает эту строку, а `toLocaleDateString` форматирует по-русски.

### Порядковый номер vs ID в базе (Page3)

```jsx
{products.map((p, index) => (
    <tr key={p.id}>
        <td>{index + 1}</td>          {/* Порядковый номер в выборке: 1, 2, 3... */}
        <td>#{p.id}</td>              {/* Реальный ID в БД: 8, 7, 6... */}
        <td>{p.name}</td>
    </tr>
))}
```

Данные отсортированы `ORDER BY id DESC`, поэтому товар с ID=8 стоит первым. Но его порядковый номер в таблице — 1. Два столбца наглядно объясняют эту разницу.

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
│  services/api.js ─── Все HTTP-запросы       │               │
│       │                                      │               │
└───────┼──────────────────────────────────────┼───────────────┘
        │                                      │
        │         HTTP (Bearer Token)          │
        │                                      │
┌───────┼──────────────────────────────────────┼───────────────┐
│       │         СЕРВЕР (Express)             │               │
│       │                                      │               │
│  authMiddleware ──── Проверяет JWT           │               │
│  adminMiddleware ─── Проверяет роль          │               │
│       │                                      │               │
│  /api/auth/login   /api/products    /api/users               │
│       │                  │               │                   │
│       └──────────────────┼───────────────┘                   │
│                          │                                   │
│                        db.js (Pool)                          │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                     PostgreSQL
                    ┌───────────┐
                    │  users    │
                    │  products │
                    └───────────┘
```

---

## Используемые технологии и библиотеки

### Backend

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| `express` | ^4.18.2 | HTTP-сервер и маршрутизация |
| `pg` | ^8.11.3 | Клиент PostgreSQL (пул соединений) |
| `bcryptjs` | ^2.4.3 | Хэширование паролей |
| `jsonwebtoken` | ^9.0.2 | Создание и проверка JWT-токенов |
| `cors` | ^2.8.5 | Политика CORS для браузеров |
| `dotenv` | ^16.3.1 | Загрузка переменных из `.env` |
| `nodemon` | ^3.0.2 | Автоперезапуск сервера при изменениях (dev) |

### Frontend

| Пакет | Версия | Назначение |
|-------|--------|-----------|
| `react` | ^18.2.0 | UI-библиотека, компонентный подход |
| `react-dom` | ^18.2.0 | Рендеринг React в DOM браузера |
| `react-router-dom` | ^6.22.0 | Клиентская маршрутизация (SPA) |
| `react-scripts` | 5.0.1 | Сборка проекта (Create React App) |

---

## Тестовые данные для входа

| Роль | Email | Пароль | Доступ |
|------|-------|--------|--------|
| Администратор | admin@example.com | password | Все страницы + Админ-панель |
| Пользователь | ivan@example.com | password | Page1, Page2, Page3 |
| Пользователь | maria@example.com | password | Page1, Page2, Page3 |
