import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаём контекст авторизации
const AuthContext = createContext(null);

// Провайдер: оборачивает всё приложение
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // При первой загрузке — восстановить сессию из localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Сохранить данные после входа/регистрации
  const saveAuth = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Очистить данные при выходе
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

// Хук для использования контекста в компонентах
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
