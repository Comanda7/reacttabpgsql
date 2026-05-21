import React, { useEffect, useState } from 'react';
import { getProducts, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Вспомогательная функция форматирования даты
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// Форматирование цены
const formatPrice = (price) =>
  Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const Page1 = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');
  const [errorUsers, setErrorUsers] = useState('');

  // Загрузка товаров
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setErrorProducts(err.message))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Загрузка пользователей (только для admin)
  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoadingUsers(false);
      return;
    }
    getUsers()
      .then(setUsers)
      .catch((err) => setErrorUsers(err.message))
      .finally(() => setLoadingUsers(false));
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">📋 Страница 1 — Таблица товаров</h1>
        <p className="page-subtitle">
          Данные отображаются в табличном виде, отсортированы по ID от меньшего к большему (от первой записи).
        </p>

        {/* ===== Таблица товаров ===== */}
        <div className="table-wrapper">
          <h2>🛒 Товары ({products.length})</h2>
          {loadingProducts && <div className="loading">Загрузка товаров...</div>}
          {errorProducts && <div className="error-msg">{errorProducts}</div>}
          {!loadingProducts && !errorProducts && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>На складе</th>
                  <th>Добавлен</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.description?.slice(0, 55)}…</span>
                    </td>
                    <td>{p.category}</td>
                    <td className="price">{formatPrice(p.price)}</td>
                    <td>
                      <span className="badge badge-stock">{p.stock} шт.</span>
                    </td>
                    <td>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== Таблица пользователей — только для admin ===== */}
        {user?.role === 'admin' && (
          <>
            <div className="section-divider" />
            <div className="table-wrapper">
              <h2>👑 Все пользователи системы ({users.length})</h2>
              {loadingUsers && <div className="loading">Загрузка пользователей...</div>}
              {errorUsers && <div className="error-msg">{errorUsers}</div>}
              {!loadingUsers && !errorUsers && (
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
          </>
        )}
      </div>
    </>
  );
};

export default Page1;
