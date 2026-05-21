// services/api.js — Все запросы к серверу

const BASE_URL = '/api';

// Вспомогательная функция: получить токен из localStorage
const getToken = () => localStorage.getItem('token');

// Вспомогательная функция: универсальный fetch с авторизацией
const request = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data;
};

// ===== Авторизация =====
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (username, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

// ===== Товары =====
export const getProducts = () => request('/products');
export const getProductsReversed = () => request('/products/reversed');

// ===== Пользователи (только admin) =====
export const getUsers = () => request('/users');
