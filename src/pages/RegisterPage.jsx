import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || '/editor');
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    try {
      await register(email, password);
      navigate('/editor');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    clearError();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background — тетрадная разлиновка */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1="0" y1={`${(i + 1) * 2.5}%`} x2="100%" y2={`${(i + 1) * 2.5}%`} stroke="#006584" strokeWidth="1" />
        ))}
        <line x1="8%" y1="0" x2="8%" y2="100%" stroke="#B71234" strokeWidth="1.5" opacity="0.3" />
      </svg>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-stone-200/60 p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg"
              className="w-11 h-11"
              alt="Логотип Точилки"
            />
            <div>
              <div className="text-lg font-semibold text-stone-900">Идеальная тетрадь</div>
              <div className="text-xs text-stone-500">Создание аккаунта</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm ring-1 ring-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="w-full h-12 px-4 rounded-xl bg-white ring-1 ring-stone-200 text-stone-800 focus:ring-2 focus:ring-brand-blue/40 outline-none transition-shadow"
                placeholder="you@school.ru"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700 mb-1">Пароль</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white ring-1 ring-stone-200 text-stone-800 focus:ring-2 focus:ring-brand-blue/40 outline-none transition-shadow"
                  placeholder="Минимум 8 символов"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Consent checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-stone-300 text-brand-blue focus:ring-brand-blue mt-0.5"
                  required
                />
                <span>
                  Я принимаю условия{' '}
                  <a href="#" className="text-brand-blue hover:underline">оферты</a>,{' '}
                  <a href="#" className="text-brand-blue hover:underline">пользовательского соглашения</a>{' '}
                  и{' '}
                  <a href="#" className="text-brand-blue hover:underline">политики конфиденциальности</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || isLoading}
              className="w-full h-12 rounded-xl bg-brand-blue text-white font-semibold hover:bg-[#005270] shadow-[0_4px_14px_rgba(0,101,132,0.30)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Создать аккаунт"}
            </button>
          </form>

          <div className="border-t border-stone-200/60 mt-6 pt-6 text-center">
            <span className="text-sm text-stone-500">Уже есть аккаунт? </span>
            <Link to="/login" className="text-sm font-medium text-brand-blue hover:underline">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
