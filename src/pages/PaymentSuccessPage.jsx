import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PaymentSuccessPage — страница после успешной оплаты.
 * ЮKassa перенаправляет сюда по return_url.
 */
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#EDF2F7] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-stone-200/60 p-10">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-3">Оплата прошла!</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            Pro-подписка на «Идеальную тетрадь» активирована. Теперь вам доступны все функции конструктора.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/editor"
              className="w-full h-12 rounded-xl bg-[#006584] text-white font-semibold flex items-center justify-center hover:bg-[#005270] shadow-[0_4px_14px_rgba(0,101,132,0.30)] transition-all"
            >
              Перейти к редактору
            </Link>
            <Link
              to="/account"
              className="w-full h-10 rounded-xl text-stone-500 font-medium hover:text-stone-700 hover:bg-stone-50 flex items-center justify-center transition-colors text-sm"
            >
              Личный кабинет
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
