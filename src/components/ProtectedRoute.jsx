import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

/**
 * ProtectedRoute — обёртка для маршрутов, требующих авторизации.
 * Если пользователь не залогинен → редирект на /login с сохранением intended URL.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Пока грузим сессию — показать лоадер
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="flex items-center gap-3 text-stone-500">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Сохраняем URL, куда пользователь хотел попасть
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
