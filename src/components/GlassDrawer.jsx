import React from 'react';
import { trackGoal } from '../utils/analytics';

const PROMO_APPS = [
  { app_name: 'handwriting_generator', label: 'Генератор прописей' },
  { app_name: 'ruling_generator', label: 'Генератор разлиновки' },
  { app_name: 'oral_math_randomizer', label: 'Рандомайзер устного счета' },
  { app_name: 'reading_technique_analyzer', label: 'Анализатор техники чтения' },
  { app_name: 'dictation_constructor', label: 'Конструктор словарных диктантов' },
  { app_name: 'student_profile', label: 'Характеристика ученика' },
  { app_name: 'seating_generator', label: 'Генератор рассадки' },
  { app_name: 'crossword_constructor', label: 'Конструктор кроссвордов' },
  { app_name: 'teen_slang_dictionary', label: 'Словарь подросткового сленга' },
  { app_name: 'tutor_efficiency', label: 'Оценка эффективности репетитора' },
  { app_name: 'career_orientation_test', label: 'Тест на профориентацию' },
  { app_name: 'deadline_tracker', label: 'Трекер дедлайнов' },
  { app_name: 'worksheet_generator', label: 'Генератор рабочих листов' },
  { app_name: 'coming_soon', label: 'Продолжение следует...' },
];

function GlassDrawer({ isOpen, onClose, onToggle }) {
  return (
    <aside 
      className={`fixed right-0 top-0 bottom-0 z-40 transition-transform duration-300 ease-out-quart flex ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'}`}
      style={{ width: '320px' }}
    >
      <button 
        className="h-24 w-10 mt-20 bg-brand-blue text-white rounded-l-xl flex items-center justify-center shadow-md font-semibold [writing-mode:vertical-lr] rotate-180 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        Точилка
      </button>
      <div className="flex-1 bg-white/70 backdrop-blur-md border-l border-white/50 shadow-lg flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {PROMO_APPS.map((app, i) => {
            if (i === 6) {
              return (
                <React.Fragment key="all">
                  <button onClick={() => { trackGoal('crosspromo_clicked', { app_name: 'all_services' }); window.open('https://onlinetochilka.github.io/', '_blank'); }} className="w-full text-left p-3 rounded-xl bg-brand-burgundy text-white font-semibold shadow-sm hover:-translate-y-0.5 transition-transform">
                    Все приложения Точилки
                  </button>
                  <button onClick={() => { trackGoal('crosspromo_clicked', { app_name: app.app_name }); window.open(`https://onlinetochilka.github.io/${app.app_name}/`, '_blank'); }} className="w-full text-left p-3 rounded-xl bg-white/50 hover:bg-white text-stone-700 shadow-sm border border-stone-200/50 transition-colors text-sm font-medium">
                    {app.label}
                  </button>
                </React.Fragment>
              );
            }
            return (
              <button 
                key={app.app_name}
                onClick={() => { if(app.app_name !== 'coming_soon') { trackGoal('crosspromo_clicked', { app_name: app.app_name }); window.open(`https://onlinetochilka.github.io/${app.app_name}/`, '_blank'); } }} 
                className="w-full text-left p-3 rounded-xl bg-white/50 hover:bg-white text-stone-700 shadow-sm border border-stone-200/50 transition-colors text-sm font-medium"
              >
                {app.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default GlassDrawer;
