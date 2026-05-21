-- =============================================
-- Лабораторная работа: Инициализация базы данных
-- =============================================

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
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

-- =============================================
-- Тестовые данные
-- =============================================

-- Пользователи (пароль для всех: "password123")
-- Hash сгенерирован через bcrypt с saltRounds=10
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('ivan', 'ivan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('maria', 'maria@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('petr', 'petr@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT DO NOTHING;

-- Товары
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('Ноутбук Dell XPS 15', 'Мощный ноутбук для разработчиков с процессором Intel Core i7', 89990.00, 'Электроника', 15, 'https://picsum.photos/seed/laptop/400/300'),
('Механическая клавиатура', 'RGB клавиатура с Cherry MX Red переключателями', 7990.00, 'Периферия', 42, 'https://picsum.photos/seed/keyboard/400/300'),
('Монитор LG 27"', '4K IPS монитор с частотой 144 Гц и HDR400', 34500.00, 'Электроника', 8, 'https://picsum.photos/seed/monitor/400/300'),
('Беспроводные наушники', 'Наушники с активным шумоподавлением, 30 часов работы', 12990.00, 'Аудио', 25, 'https://picsum.photos/seed/headphones/400/300'),
('Веб-камера 4K', 'Камера для стриминга и видеоконференций, автофокус', 5490.00, 'Периферия', 33, 'https://picsum.photos/seed/webcam/400/300'),
('SSD 1TB NVMe', 'Накопитель M.2 PCIe Gen4, скорость чтения 7000 МБ/с', 9800.00, 'Комплектующие', 60, 'https://picsum.photos/seed/ssd/400/300'),
('Игровая мышь', 'Оптическая мышь 25600 DPI, 11 программируемых кнопок', 4290.00, 'Периферия', 55, 'https://picsum.photos/seed/mouse/400/300'),
('USB-хаб 7 портов', 'Алюминиевый хаб USB 3.0 с блоком питания', 2190.00, 'Аксессуары', 80, 'https://picsum.photos/seed/hub/400/300')
ON CONFLICT DO NOTHING;
