import React from 'react';
import { trackGoal } from '../../utils/analytics';

const PageSettings = ({ format, orientation, margin, layout, mirrorMargins, updateState }) => {
  return (
    <div className="space-y-3">
      {/* Формат бумаги */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Формат бумаги</div>
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl">
          <button className={`h-7 rounded-lg text-xs transition-all ${format === 'a4' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'a4' })}>A4</button>
          <button className={`h-7 rounded-lg text-xs transition-all ${format === 'a5' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'a5' })}>A5</button>
          <button className={`h-7 rounded-lg text-xs transition-all ${format === 'notebook' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'notebook' })}>Тетрадь</button>
        </div>
      </div>

      {/* Ориентация */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Ориентация</div>
        <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-xl">
          <button className={`flex items-center justify-center gap-1 h-7 rounded-lg text-xs transition-all ${orientation === 'portrait' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ orientation: 'portrait' })}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/></svg> Книжная
          </button>
          <button className={`flex items-center justify-center gap-1 h-7 rounded-lg text-xs transition-all ${orientation === 'landscape' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ orientation: 'landscape' })}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg> Альбомная
          </button>
        </div>
      </div>

      {/* Поля */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Поля</div>
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl">
          <button className={`h-7 rounded-lg text-xs transition-all ${margin === 'left' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'left' })}>Слева</button>
          <button className={`h-7 rounded-lg text-xs transition-all ${margin === 'none' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'none' })}>Нет</button>
          <button className={`h-7 rounded-lg text-xs transition-all ${margin === 'right' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'right' })}>Справа</button>
        </div>
      </div>

      {/* Размещение */}
      <div>
        <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Размещение</div>
        <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-2xl">
          <button 
            className={`h-9 px-4 rounded-xl text-xs transition-all ${layout === '1-page' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ layout: '1-page' })}
          >
            1 лист
          </button>
          <button 
            className={`h-9 px-4 rounded-xl text-xs transition-all ${layout === '2-pages' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
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
