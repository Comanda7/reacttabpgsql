import React, { useEffect, useState } from 'react';
import { getProductsReversed } from '../services/api';
import Navbar from '../components/Navbar';

const formatPrice = (price) =>
  Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

const Page3 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProductsReversed()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">🔄 Страница 3 — Обратный порядок</h1>
        <p className="page-subtitle">
          Товары из PostgreSQL выводятся в обратном порядке: от последней добавленной записи к первой (ORDER BY id DESC).
        </p>

        <div className="table-wrapper">
          <h2>📦 Товары (с последней записи) — {products.length} позиций</h2>

          {loading && <div className="loading">Загрузка данных...</div>}
          {error && <div className="error-msg">⚠️ {error}</div>}

          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID в БД</th>
                  <th>Название товара</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>На складе</th>
                  <th>Добавлен</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={p.id}>
                    {/* Порядковый номер в текущей выборке (1, 2, 3...) */}
                    <td>
                      <span className="row-number">{index + 1}</span>
                    </td>
                    {/* Реальный ID в базе данных */}
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{p.id}</td>
                    <td><strong>{p.name}</strong></td>
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

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 18px', fontSize: '0.85rem', color: '#1e40af' }}>
          <strong>💡 SQL-запрос для этой страницы:</strong>
          <pre style={{ marginTop: 6, fontFamily: 'monospace', fontSize: '0.82rem' }}>
            SELECT * FROM products ORDER BY id DESC;
          </pre>
        </div>
      </div>
    </>
  );
};

export default Page3;
