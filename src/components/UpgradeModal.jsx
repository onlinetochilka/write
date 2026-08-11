import React from 'react';
import { Link } from 'react-router-dom';

/**
 * UpgradeModal — модалка «Перейдите на Pro».
 * Показывается при попытке использовать Pro-фичу в Free-тарифе.
 */
export default function UpgradeModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#006584] to-[#0082a8] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#006584]/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-stone-900 mb-2">Функция Pro-подписки</h3>
        
        {featureName && (
          <p className="text-stone-600 mb-4">
            <span className="font-medium text-stone-800">«{featureName}»</span> доступна в тарифе Pro.
          </p>
        )}

        <div className="bg-stone-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <svg className="w-4 h-4 text-[#006584]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Все разлиновки и форматы
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <svg className="w-4 h-4 text-[#006584]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Разборы, геометрия, таблицы
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <svg className="w-4 h-4 text-[#006584]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            PDF без водяного знака
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-extrabold text-stone-900">199 ₽</span>
          <span className="text-stone-500">/мес</span>
          <span className="text-xs text-stone-400 ml-1">или 149 ₽/мес за год</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/register"
            className="w-full h-12 rounded-xl bg-[#006584] text-white font-semibold flex items-center justify-center hover:bg-[#005270] shadow-[0_4px_14px_rgba(0,101,132,0.30)] transition-all active:scale-[0.98]"
            onClick={onClose}
          >
            Оформить Pro-подписку
          </Link>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl text-stone-500 font-medium hover:text-stone-700 hover:bg-stone-50 transition-colors text-sm"
          >
            Не сейчас
          </button>
        </div>
      </div>
    </div>
  );
}
