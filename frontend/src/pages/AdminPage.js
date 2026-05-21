import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import Navbar from '../components/Navbar';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">👑 Панель администратора</h1>
        <p className="page-subtitle">
          Эта страница доступна только пользователям с ролью <strong>admin</strong>.
          Здесь отображается полная таблица пользователей из PostgreSQL.
        </p>

        <div className="table-wrapper">
          <h2>👥 Все пользователи системы ({users.length})</h2>

          {loading && <div className="loading">Загрузка пользователей...</div>}
          {error && <div className="error-msg">⚠️ {error}</div>}

          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя пользователя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role === 'admin' ? '👑 admin' : '👤 user'}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 18px', fontSize: '0.85rem', color: '#92400e' }}>
          <strong>🔒 Защита маршрута:</strong> Сервер проверяет JWT-токен и роль пользователя.
          Если роль не <code>admin</code> — возвращается ошибка 403 Forbidden.
          <br /><br />
          <strong>SQL-запрос:</strong>
          <pre style={{ marginTop: 4, fontFamily: 'monospace', fontSize: '0.82rem' }}>
            SELECT id, username, email, role, created_at FROM users ORDER BY id ASC;
          </pre>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
