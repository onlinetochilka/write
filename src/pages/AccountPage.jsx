import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { getSubscriptionInfo, createSubscription, cancelSubscription, PLANS } from '../api/payments';

export default function AccountPage() {
  const { user, isPro, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const sub = getSubscriptionInfo(user);

  const handleSubscribe = async (planKey) => {
    try {
      setIsLoading(true);
      setError(null);
      const { confirmation_url } = await createSubscription(planKey);
      window.location.href = confirmation_url;
    } catch (err) {
      setError(err.message || 'Ошибка при создании подписки');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Вы уверены, что хотите отменить подписку?')) {
      try {
        setIsLoading(true);
        setError(null);
        await cancelSubscription();
        window.location.reload(); // Reload user data
      } catch (err) {
        setError(err.message || 'Ошибка при отмене подписки');
        setIsLoading(false);
      }
    }
  };

  const handleChangePassword = () => {
    alert('Смена пароля скоро появится!'); // stub shows coming soon toast/alert
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="bg-white border-b border-stone-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg"
              className="w-8 h-8"
              alt="Логотип Точилки"
            />
            <span className="font-semibold text-stone-800">Идеальная тетрадь</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/editor" className="text-sm text-brand-blue hover:underline">← К редактору</Link>
            <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-700">Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-8">Личный кабинет</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm ring-1 ring-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 ring-1 ring-stone-200/60 shadow-sm">
            <h2 className="text-sm font-bold text-stone-500 uppercase mb-4">Профиль</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-stone-500">Email</div>
                <div className="text-sm font-medium text-stone-800">{user?.email}</div>
              </div>
              <button onClick={handleChangePassword} className="text-sm text-brand-blue hover:underline">Сменить пароль</button>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-2xl p-6 ring-1 ring-stone-200/60 shadow-sm">
            <h2 className="text-sm font-bold text-stone-500 uppercase mb-4">Подписка</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${sub.isActive ? 'bg-brand-blue/10 text-brand-blue' : 'bg-stone-100 text-stone-600'}`}>
                {sub.isActive ? 'Pro' : 'Free'}
              </span>
            </div>
            
            {!sub.isActive ? (
              <div className="space-y-3">
                <div className="p-3 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-800">199 ₽ / месяц</div>
                    <div className="text-xs text-stone-500">Ежемесячная оплата</div>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('monthly')} 
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-[#005270] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Выбрать
                  </button>
                </div>
                <div className="p-3 border border-brand-blue/30 bg-brand-blue/5 rounded-xl flex items-center justify-between relative overflow-hidden">
                  <div className="absolute -right-6 top-2 bg-[#B71234] text-white text-[10px] font-bold px-8 py-0.5 rotate-45 shadow-sm">
                    ВЫГОДНО
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">1788 ₽ / год</div>
                    <div className="text-xs text-brand-blue font-medium">149 ₽ в месяц</div>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('yearly')} 
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-[#005270] transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Выбрать
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-stone-600">
                <div>Следующее списание: <span className="font-medium">{sub.until?.toLocaleDateString('ru-RU')}</span></div>
                {sub.daysLeft && <div className="text-xs text-stone-500 mt-1">Осталось дней: {sub.daysLeft}</div>}
                <button 
                  onClick={handleCancel} 
                  disabled={isLoading}
                  className="mt-4 text-red-500 hover:underline text-xs disabled:opacity-50 disabled:no-underline"
                >
                  Отменить подписку
                </button>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl p-6 ring-1 ring-stone-200/60 shadow-sm md:col-span-2">
            <h2 className="text-sm font-bold text-stone-500 uppercase mb-4">Продукты экосистемы</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-blue/5 ring-1 ring-brand-blue/10">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-lg">📝</div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Идеальная тетрадь</div>
                  <div className="text-xs text-stone-500">Конструктор учебных листов</div>
                </div>
              </div>
              <a href="https://tutor.tochilka.app" className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 ring-1 ring-stone-200/60 hover:bg-stone-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-lg">📅</div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Ежедневник репетитора</div>
                  <div className="text-xs text-stone-500">tutor.tochilka.app →</div>
                </div>
              </a>
            </div>
            <p className="text-xs text-stone-400 mt-4">Больше инструментов → <a href="https://tochilka.app" className="text-brand-blue hover:underline">tochilka.app</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
