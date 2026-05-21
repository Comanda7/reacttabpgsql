import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">📦 LabShop</div>

      <div className="navbar-links">
        <NavLink
          to="/page1"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Страница 1 — Таблица
        </NavLink>
        <NavLink
          to="/page2"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Страница 2 — Карточки
        </NavLink>
        <NavLink
          to="/page3"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Страница 3 — Обратный порядок
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => isActive ? 'nav-link active admin-link' : 'nav-link admin-link'}
          >
            👑 Админ-панель
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        <span className="user-info">
          {user?.role === 'admin' ? '👑' : '👤'} {user?.username}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
