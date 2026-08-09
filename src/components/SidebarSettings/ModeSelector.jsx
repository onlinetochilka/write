import React from 'react';

const ModeSelector = ({ mode, updateState }) => {
  return (
    <section>
      <div className="flex items-center mb-2 h-4">
        <div className="text-[11px] font-bold text-stone-500 uppercase">Буквы</div>
      </div>
      <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-2xl">
        <button 
          className={`flex flex-col items-center justify-center h-10 px-4 rounded-xl text-xs leading-tight transition-all ${mode === 'tracing' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ mode: 'tracing' })}
        >
          Светлые<br/><span className={`text-[10px] font-normal ${mode === 'tracing' ? 'text-stone-500' : 'opacity-80'}`}>(обводка)</span>
        </button>
        <button 
          className={`flex flex-col items-center justify-center h-10 px-4 rounded-xl text-xs leading-tight transition-all ${mode === 'copy' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
          onClick={() => updateState({ mode: 'copy' })}
        >
          Тёмные<br/><span className={`text-[10px] font-normal ${mode === 'copy' ? 'text-stone-500' : 'opacity-80'}`}>(списывание)</span>
        </button>
      </div>
    </section>
  );
};

export default ModeSelector;
