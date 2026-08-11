import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import pb from '../api/pocketbase';
import * as authApi from '../api/auth';

/**
 * AuthProvider — контекст аутентификации и подписки.
 * 
 * Использует PocketBase SDK для авторизации.
 * Проверяет подписку на «Идеальную тетрадь» через поля write_status / write_until.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children, forceDemo = false }) {
  const [user, setUser] = useState(pb.authStore.record);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo] = useState(forceDemo);

  // Подписаться на изменения authStore
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });

    // При монтировании — проверить токен
    const init = async () => {
      setIsLoading(true);
      try {
        const refreshed = await authApi.refreshAuth();
        setUser(refreshed);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const authData = await authApi.login(email, password);
      setUser(authData.record);
      return authData.record;
    } catch (err) {
      const message = err?.response?.message || err?.message || 'Ошибка входа';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.register(email, password);
      setUser(pb.authStore.record);
      return pb.authStore.record;
    } catch (err) {
      const message = err?.response?.message || err?.message || 'Ошибка регистрации';
      // Расшифровка типичных ошибок PocketBase
      if (err?.response?.data?.email) {
        setError('Этот email уже зарегистрирован');
      } else {
        setError(message);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => {
    const isPro = authApi.isWritePro(user);

    return {
      user,
      isPro,
      isDemo,
      isLoading,
      error,
      isAuthenticated: !!user,

      // В демо-режиме все фичи «доступны» для просмотра
      isFeatureUnlocked: isPro || isDemo,

      // Показывать водяной знак: если НЕ Pro
      showWatermark: !isPro,

      login,
      register,
      logout,
      clearError,

      // Dev-хелпер: переключить Pro для тестирования (только локально)
      __devTogglePro: () => {
        setUser(prev => {
          if (!prev) return { email: 'dev@test.ru', write_status: 'active', write_until: new Date(Date.now() + 365 * 86400000).toISOString() };
          const isCurrentlyPro = authApi.isWritePro(prev);
          return {
            ...prev,
            write_status: isCurrentlyPro ? 'inactive' : 'active',
            write_until: isCurrentlyPro ? null : new Date(Date.now() + 365 * 86400000).toISOString(),
          };
        });
      },
    };
  }, [user, isDemo, isLoading, error, login, register, logout, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
