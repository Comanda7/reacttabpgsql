import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        // Авторизация
        result = await login(formData.email, formData.password);
      } else {
        // Регистрация
        result = await register(formData.username, formData.email, formData.password);
      }

      // Сохранить токен и данные пользователя в контекст
      saveAuth(result.token, result.user);

      // Перейти на первую страницу
      navigate('/page1');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {isLogin ? '🔐 Вход в систему' : '📝 Регистрация'}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Введите email и пароль для входа'
            : 'Создайте новый аккаунт для доступа к системе'}
        </p>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Поле имени пользователя — только при регистрации */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Введите имя пользователя"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={isLogin ? 'Введите пароль' : 'Минимум 6 символов'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={toggleMode}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>

        {isLogin && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, fontSize: '0.78rem', color: '#64748b' }}>
            <strong>Тестовые данные:</strong><br />
            👑 Админ: admin@example.com / password<br />
            👤 Пользователь: ivan@example.com / password
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
