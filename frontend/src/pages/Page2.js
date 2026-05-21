import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import Navbar from '../components/Navbar';

const formatPrice = (price) =>
  Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const Page2 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">🃏 Страница 2 — Карточки товаров</h1>
        <p className="page-subtitle">
          Те же данные из PostgreSQL, но оформлены в виде карточек — сетка с изображениями и описанием.
        </p>

        {loading && <div className="loading">Загрузка карточек...</div>}
        {error && <div className="error-msg">⚠️ {error}</div>}

        {!loading && !error && (
          <div className="cards-grid">
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <img
                  className="card-image"
                  src={p.image_url}
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.name)}`;
                  }}
                />
                <div className="card-body">
                  <div className="card-category">{p.category}</div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-desc">{p.description}</div>
                  <div className="card-footer">
                    <span className="card-price">{formatPrice(p.price)}</span>
                    <span className="card-stock">В наличии: {p.stock} шт.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Page2;
