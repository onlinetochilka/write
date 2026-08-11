import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-semibold text-slate-800 group-hover:text-[#006584] transition-colors">{q}</span>
        <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#006584]' : 'text-slate-400 group-hover:text-[#006584]'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed pr-12">{a}</p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="font-sans text-slate-900 selection:bg-[#006584] selection:text-white">
      <style>{`
        @keyframes draw-line {
          0% { width: 0%; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-line-1 { animation: draw-line 1.2s ease-out forwards 0.3s; }
        .animate-line-2 { animation: draw-line 1.2s ease-out forwards 0.6s; }
        .animate-line-3 { animation: draw-line 1.2s ease-out forwards 0.9s; }
        
        .animate-text-1 { animation: fade-in 0.8s ease-out forwards 1.8s; opacity: 0; }
        .animate-text-2 { animation: fade-in 0.8s ease-out forwards 2.3s; opacity: 0; }
        .animate-text-3 { animation: fade-in 0.8s ease-out forwards 2.8s; opacity: 0; }
        
        html { scroll-behavior: smooth; }
      `}</style>

      {/* SECTION 1: HERO */}
      <section className="bg-[#EDF2F7] relative pt-20 pb-28 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#006584]/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#B71234]/5 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-8">
                <img src="https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg" alt="Точилка лого" className="h-10" />
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest border-l-2 border-slate-300 pl-3">от экосистемы Точилка</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Идеальная тетрадь — <br />
                <span className="text-[#006584]">собирайте учебные листы за минуты</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
                Прописи, карточки, разборы по русскому и математике. Без Word, без мучений — распечатайте и раздайте.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
                <Link to="/demo" className="px-8 py-4 bg-[#B71234] text-white rounded-2xl font-semibold text-lg hover:bg-[#9a0f2b] transition-all text-center shadow-lg shadow-[#B71234]/20 hover:-translate-y-1">
                  Попробовать бесплатно
                </Link>
                <a href="#pricing" className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all text-center shadow-sm hover:shadow-md hover:-translate-y-1 border border-slate-200">
                  Посмотреть тарифы
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-white/60 backdrop-blur-sm py-2.5 px-5 rounded-full border border-slate-200/60 shadow-sm">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                Уже создано 2 500+ листов преподавателями
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full max-w-lg relative">
              <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl p-10 aspect-[3/4] relative overflow-hidden border border-slate-200 transform rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
                {/* Spiral binding illusion */}
                <div className="absolute top-0 bottom-0 left-4 w-4 flex flex-col justify-evenly">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-8 h-2 bg-slate-300 rounded-full shadow-sm -ml-6"></div>
                  ))}
                </div>
                
                <div className="pl-6 pt-8 w-full h-full flex flex-col space-y-14 relative z-10">
                  <div className="relative h-10 w-full border-b-[1.5px] border-transparent">
                    <div className="absolute bottom-0 left-0 h-[1.5px] bg-[#006584]/30 w-0 animate-line-1"></div>
                    <div className="absolute bottom-2 left-4 font-serif italic text-4xl text-slate-700 animate-text-1">Аа</div>
                  </div>
                  <div className="relative h-10 w-full border-b-[1.5px] border-transparent">
                    <div className="absolute bottom-0 left-0 h-[1.5px] bg-[#006584]/30 w-0 animate-line-2"></div>
                    <div className="absolute bottom-2 left-24 font-serif italic text-4xl text-slate-700 animate-text-2">Бб</div>
                  </div>
                  <div className="relative h-10 w-full border-b-[1.5px] border-transparent">
                    <div className="absolute bottom-0 left-0 h-[1.5px] bg-[#006584]/30 w-0 animate-line-3"></div>
                    <div className="absolute bottom-2 left-44 font-serif italic text-4xl text-slate-700 animate-text-3">Вв</div>
                  </div>
                  <div className="absolute bottom-10 right-6 opacity-20">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#006584" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                      <path d="M2 2l7.586 7.586"></path>
                      <circle cx="11" cy="11" r="2"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEMS -> SOLUTIONS */}
      <section className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 inline-block relative">
              Знакомо?
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#B71234] rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                pain: "«30 минут в Word, чтобы выровнять строчки для прописей»",
                solution: "«Выберите разлиновку и введите текст — лист готов за 2 минуты»"
              },
              {
                pain: "«Нужен лист для морфемного разбора, а отрисовать дуги корня в Word — невозможно»",
                solution: "«Выделите слово мышкой и нажмите ⌒ — разметка появится на печатном листе»"
              },
              {
                pain: "«Хочу дать карточку с таблицей и картинкой, но вёрстка разъезжается при печати»",
                solution: "«Всё, что вы видите на экране, 1 в 1 выходит из принтера. Миллиметр в миллиметр.»"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-md rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 ring-1 ring-slate-200/60 hover:ring-[#006584]/30 hover:shadow-xl hover:shadow-[#006584]/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-[#006584]/5 transition-colors"></div>
                <div className="mb-8">
                  <div className="text-[#B71234] font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#B71234]/10 flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    Боль
                  </div>
                  <p className="text-slate-600 font-medium italic">{item.pain}</p>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <div className="text-[#006584] font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#006584]/10 flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    Решение
                  </div>
                  <p className="text-slate-900 font-semibold">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-20 lg:py-28 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 inline-block relative">
              Как это работает — три шага
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#006584] rounded-full"></div>
            </h2>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-slate-300 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
              {[
                {
                  step: 1,
                  title: "Настройте лист",
                  sub: "Выберите разлиновку, формат бумаги и ориентацию",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                },
                {
                  step: 2,
                  title: "Введите текст",
                  sub: "Рукописный или печатный шрифт, режим обводки или списывания",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                },
                {
                  step: 3,
                  title: "Распечатайте",
                  sub: "Нажмите одну кнопку — и лист готов для раздачи ученикам",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#006584] text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      {item.step}
                    </div>
                    <svg className="w-10 h-10 text-[#006584]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 px-4">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURE GRID */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 inline-block relative">
              Всё, что нужно, — в одном конструкторе
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#B71234] rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "6 типов разлиновки",
                desc: "Косая (частая и редкая), узкая и широкая линия, клетка, чистый лист",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              },
              {
                title: "Морфемный + синтаксический разбор",
                desc: "Приставка ¬, корень ⌒, суффикс ^, окончание □, основа. Подлежащее, сказуемое, дополнение...",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              },
              {
                title: "Параметрическая геометрия",
                desc: "Треугольники, прямоугольники, окружности, параллелограммы, трапеции с точными размерами в мм",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              },
              {
                title: "Координатные инструменты",
                desc: "Координатный луч, прямая, плоскость с настраиваемым масштабом",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              },
              {
                title: "Таблицы и картинки",
                desc: "Вставка таблиц N×M, изображений с авто-удалением белого фона",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              },
              {
                title: "Мгновенный экспорт в PDF",
                desc: "Точная передача размеров на печати — миллиметр в миллиметр",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:scale-[1.02] hover:bg-white hover:shadow-xl hover:shadow-[#006584]/5 hover:border-[#006584]/20 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 text-[#006584]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: PRICING */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#EDF2F7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Тарифы</h2>
            
            <div className="flex items-center justify-center gap-4 bg-slate-200/50 inline-flex p-1.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${!isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Ежемесячно
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Ежегодно <span className="bg-[#B71234]/10 text-[#B71234] text-xs py-0.5 px-2 rounded-full font-bold">-25%</span>
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* FREE CARD */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Базовый</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">0 ₽</span>
                  <span className="text-slate-500 font-medium">навсегда</span>
                </div>
              </div>
              
              <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {[
                    "Клетка / линии / чистый лист",
                    "Рукописный + печатный шрифт",
                    "Отрезки / текстовые поля / картинки",
                    "Экспорт PDF (с водяным знаком)"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <svg className="w-5 h-5 text-[#006584] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link to="/register" className="w-full block py-4 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-center border border-slate-200">
                Начать бесплатно
              </Link>
            </div>
            
            {/* PRO CARD */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-[#006584]/10 border-2 border-[#006584]/30 ring-2 ring-[#006584]/5 flex flex-col h-full relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-r from-[#006584] to-[#0082a8] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md whitespace-nowrap">
                  Популярный выбор
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">{isYearly ? '149' : '199'} ₽</span>
                  <span className="text-slate-500 font-medium">/мес</span>
                </div>
                {isYearly && <div className="text-sm text-green-600 font-medium mt-1">1 788 ₽ списывается раз в год</div>}
              </div>
              
              <div className="flex-grow">
                <p className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Всё из Базового, плюс:</p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Косая линейка (прописи)",
                    "A5 / тетрадный лист / альбомная ориентация",
                    "Синтаксический + морфемный разбор",
                    "Все геом. фигуры + построения",
                    "Координатные инструменты",
                    "Таблицы N×M / маркер",
                    "2 листа рядом",
                    "Мат. режим «1 символ = 1 клетка»",
                    <span className="font-bold">PDF без водяного знака</span>
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <svg className="w-5 h-5 text-[#B71234] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link to="/register" className="w-full block py-4 bg-[#006584] text-white rounded-xl font-semibold hover:bg-[#00516a] transition-all text-center shadow-lg shadow-[#006584]/30 hover:-translate-y-0.5">
                Оформить подписку
              </Link>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <a href="https://tochilka.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#006584] font-medium transition-colors group">
              Ещё больше инструментов для преподавателя 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
              <span className="underline decoration-slate-300 group-hover:decoration-[#006584] underline-offset-4">tochilka.app</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 inline-block relative">
              Частые вопросы
            </h2>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-100">
            {[
              {
                q: "Нужно ли устанавливать программу?",
                a: "Нет, «Идеальная тетрадь» работает прямо в браузере. Не нужна установка, не нужен Word."
              },
              {
                q: "Можно ли сохранить лист как PDF?",
                a: "Да. Нажмите «Печать / Сохранить как PDF» и выберите принтер «Сохранить как PDF»."
              },
              {
                q: "Какие форматы бумаги поддерживаются?",
                a: "A4, A5 и тетрадный лист. Книжная и альбомная ориентация."
              },
              {
                q: "Как работает демо-режим?",
                a: "Вы можете протестировать все функции конструктора без регистрации. Листы скачиваются с фирменным водяным знаком. Для скачивания чистых листов оформите подписку."
              },
              {
                q: "Есть ли скидка для школ?",
                a: "Напишите нам — обсудим специальные условия для образовательных учреждений."
              },
              {
                q: "Как оплатить?",
                a: "Банковские карты (Visa, Mastercard, МИР), ЮMoney, СБП через защищённый платёжный шлюз ЮKassa."
              },
              {
                q: "Есть ли другие инструменты?",
                a: "Да! У нас есть «Ежедневник репетитора» для управления расписанием. Посмотрите весь набор на tochilka.app."
              }
            ].map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg" alt="Точилка" className="h-8 brightness-0 invert opacity-90" />
            <span className="text-slate-400 font-medium">© Точилка, 2026</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm font-medium">
            <a href="https://tutor.tochilka.app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              Ежедневник репетитора
            </a>
            <span className="hidden sm:inline text-slate-700">•</span>
            <a href="https://tochilka.app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              tochilka.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
