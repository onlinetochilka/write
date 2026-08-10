import React from 'react';
import { trackGoal } from '../../utils/analytics';

const PageSettings = ({ format, orientation, margin, layout, mirrorMargins, updateState }) => {
  return (
    <div className="space-y-3">
      {/* Формат бумаги */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Формат бумаги</div>
        <div className="grid grid-cols-3 gap-1.5">
          <button className={`h-9 rounded-lg text-xs transition-all ${format === 'a4' ? 'bg-amber-50 text-amber-700 font-medium shadow-sm ring-1 ring-amber-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ format: 'a4' })}>A4</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${format === 'a5' ? 'bg-amber-50 text-amber-700 font-medium shadow-sm ring-1 ring-amber-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ format: 'a5' })}>A5</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${format === 'notebook' ? 'bg-amber-50 text-amber-700 font-medium shadow-sm ring-1 ring-amber-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ format: 'notebook' })}>Тетрадь</button>
        </div>
      </div>

      {/* Ориентация */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Ориентация</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button className={`flex items-center justify-center gap-1 h-9 rounded-lg text-xs transition-all ${orientation === 'portrait' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm ring-1 ring-emerald-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ orientation: 'portrait' })}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/></svg> Книжная
          </button>
          <button className={`flex items-center justify-center gap-1 h-9 rounded-lg text-xs transition-all ${orientation === 'landscape' ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm ring-1 ring-emerald-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ orientation: 'landscape' })}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg> Альбомная
          </button>
        </div>
      </div>

      {/* Поля */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Поля</div>
        <div className="grid grid-cols-3 gap-1.5">
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'left' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'left' })}>Слева</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'none' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'none' })}>Нет</button>
          <button className={`h-9 rounded-lg text-xs transition-all ${margin === 'right' ? 'bg-rose-50 text-rose-700 font-medium shadow-sm ring-1 ring-rose-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`} onClick={() => updateState({ margin: 'right' })}>Справа</button>
        </div>
      </div>

      {/* Размещение */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Размещение</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            className={`h-9 px-4 rounded-xl text-xs transition-all ${layout === '1-page' ? 'bg-sky-50 text-sky-700 font-medium shadow-sm ring-1 ring-sky-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`}
            onClick={() => updateState({ layout: '1-page' })}
          >
            1 лист
          </button>
          <button 
            className={`h-9 px-4 rounded-xl text-xs transition-all ${layout === '2-pages' ? 'bg-sky-50 text-sky-700 font-medium shadow-sm ring-1 ring-sky-500/30' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900'}`}
            onClick={() => { trackGoal('layout_2pages'); updateState({ layout: '2-pages' }); }}
          >
            2 листа рядом
          </button>
        </div>
        
        {layout === '2-pages' && (
          <label className="flex items-center gap-2 mt-2 text-xs text-stone-600 cursor-pointer">
            <input type="checkbox" checked={mirrorMargins} onChange={(e) => updateState({ mirrorMargins: e.target.checked })} />
            Зеркальные поля
          </label>
        )}
      </div>
    </div>
  );
};

export default PageSettings;
