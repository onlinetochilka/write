import React from 'react';
import { trackGoal } from '../../utils/analytics';

const GridOptions = ({ grid, mathMode, updateState }) => {
  return (
    <section>
      <div className="flex justify-between items-center text-sm font-medium text-stone-700 mb-2">
        Разлиновка
        {grid === 'squared' ? (
          <label className="flex items-center gap-2 text-xs font-normal text-stone-600 cursor-pointer">
            <input type="checkbox" checked={mathMode} onChange={(e) => { trackGoal('math_mode_toggled'); updateState({ mathMode: e.target.checked }); }} className="rounded text-brand-blue focus:ring-brand-blue w-3 h-3" />
            1 символ = 1 клетка
          </label>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-2xl">
        <button 
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs leading-tight transition-all ${grid === 'frequent' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'frequent' })}
        >
          Частая косая<br/><span className={`text-[10px] font-normal ${grid === 'frequent' ? 'text-stone-500' : 'opacity-80'}`}>(1 класс)</span>
        </button>
        <button 
          className={`flex items-center justify-center h-8 px-2 rounded-xl text-xs transition-all ${grid === 'slanted' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'slanted' })}
        >
          Редкая косая
        </button>
        <button 
          className={`flex items-center justify-center h-8 px-2 rounded-xl text-xs transition-all ${grid === 'narrow' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'narrow' })}
        >
          Узкая линия
        </button>
        <button 
          className={`flex items-center justify-center h-8 px-2 rounded-xl text-xs transition-all ${grid === 'wide' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'wide' })}
        >
          Широкая линия
        </button>
        <button 
          className={`flex items-center justify-center h-8 px-2 rounded-xl text-xs transition-all ${grid === 'squared' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'squared' })}
        >
          Клетка
        </button>
        <button 
          className={`flex items-center justify-center h-8 px-2 rounded-xl text-xs transition-all ${grid === 'none' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ grid: 'none' })}
        >
          Просто лист
        </button>
      </div>
    </section>
  );
};

export default GridOptions;
