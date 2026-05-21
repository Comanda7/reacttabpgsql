import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Публичный маршрут — авторизация/регистрация */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищённые маршруты — только для авторизованных */}
          <Route
            path="/page1"
            element={<PrivateRoute><Page1 /></PrivateRoute>}
          />
          <Route
            path="/page2"
            element={<PrivateRoute><Page2 /></PrivateRoute>}
          />
          <Route
            path="/page3"
            element={<PrivateRoute><Page3 /></PrivateRoute>}
          />

          {/* Маршрут только для администратора */}
          <Route
            path="/admin"
            element={<PrivateRoute adminOnly={true}><AdminPage /></PrivateRoute>}
          />

          {/* Редирект с корня */}
          <Route path="/" element={<Navigate to="/page1" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/page1" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
