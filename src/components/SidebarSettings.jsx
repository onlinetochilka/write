import React, { useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';
import SmartMenu from './SmartMenu';
import { trackGoal } from '../utils/analytics';

const MemoizedOptions = React.memo(({ 
  format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, updateState 
}) => {
  return (
    <>
      <section>
        <div className="flex justify-between items-center text-sm font-medium text-stone-700 mb-2">
          Разлиновка
          {grid === 'squared' || grid === 'large_squared' ? (
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
            className={`flex items-center justify-center h-10 px-2 rounded-xl text-xs transition-all ${grid === 'slanted' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ grid: 'slanted' })}
          >
            Редкая косая
          </button>
          <button 
            className={`flex items-center justify-center h-10 px-2 rounded-xl text-xs transition-all ${grid === 'narrow' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ grid: 'narrow' })}
          >
            Узкая линия
          </button>
          <button 
            className={`flex items-center justify-center h-10 px-2 rounded-xl text-xs transition-all ${grid === 'wide' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ grid: 'wide' })}
          >
            Широкая линия
          </button>
          <button 
            className={`flex items-center justify-center h-10 px-2 rounded-xl text-xs transition-all ${grid === 'squared' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ grid: 'squared' })}
          >
            Клетка
          </button>
          <button 
            className={`flex items-center justify-center h-10 px-2 rounded-xl text-xs transition-all ${grid === 'large_squared' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ grid: 'large_squared' })}
          >
            Крупная клетка
          </button>
        </div>
      </section>
      
      <section>
         <div className="text-sm font-medium text-stone-700 mb-2 uppercase tracking-wide text-xs">Как пишем буквы?</div>
         <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-2xl">
          <button 
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs leading-tight transition-all ${mode === 'tracing' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ mode: 'tracing' })}
          >
            Светлые<br/><span className={`text-[10px] font-normal ${mode === 'tracing' ? 'text-stone-500' : 'opacity-80'}`}>(обводка)</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs leading-tight transition-all ${mode === 'copy' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
            onClick={() => updateState({ mode: 'copy' })}
          >
            Тёмные<br/><span className={`text-[10px] font-normal ${mode === 'copy' ? 'text-stone-500' : 'opacity-80'}`}>(списывание)</span>
          </button>
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-xl shadow-sm p-3 space-y-4">
        <div className="text-sm font-medium text-stone-700 uppercase tracking-wide text-xs select-none">Настройки страницы</div>
        
        {/* Формат бумаги */}
        <div>
          <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Формат бумаги</div>
          <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl">
            <button className={`h-8 rounded-lg text-xs transition-all ${format === 'a4' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'a4' })}>A4</button>
            <button className={`h-8 rounded-lg text-xs transition-all ${format === 'a5' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'a5' })}>A5</button>
            <button className={`h-8 rounded-lg text-xs transition-all ${format === 'notebook' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ format: 'notebook' })}>Тетрадь</button>
          </div>
        </div>

        {/* Ориентация */}
        <div>
          <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Ориентация</div>
          <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-xl">
            <button className={`flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all ${orientation === 'portrait' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ orientation: 'portrait' })}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/></svg> Книжная
            </button>
            <button className={`flex items-center justify-center gap-1 h-8 rounded-lg text-xs transition-all ${orientation === 'landscape' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ orientation: 'landscape' })}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg> Альбомная
            </button>
          </div>
        </div>

        {/* Поля */}
        <div>
          <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Поля</div>
          <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl">
            <button className={`h-8 rounded-lg text-xs transition-all ${margin === 'left' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'left' })}>Слева</button>
            <button className={`h-8 rounded-lg text-xs transition-all ${margin === 'none' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'none' })}>Нет</button>
            <button className={`h-8 rounded-lg text-xs transition-all ${margin === 'right' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`} onClick={() => updateState({ margin: 'right' })}>Справа</button>
          </div>
        </div>

        {/* Размещение */}
        <div>
          <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase">Размещение</div>
          <div className="grid grid-cols-2 gap-1 bg-stone-100/80 p-1 rounded-2xl">
            <button 
              className={`h-10 px-4 rounded-xl text-xs transition-all ${layout === '1-page' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
              onClick={() => updateState({ layout: '1-page' })}
            >
              1 лист
            </button>
            <button 
              className={`h-10 px-4 rounded-xl text-xs transition-all ${layout === '2-pages' ? 'bg-white text-stone-900 font-medium shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'}`}
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
      </section>
    </>
  );
});

function SidebarSettings({ onOpenHelp }) {
  const { state, updateState } = useStore();
  const editorRef = useRef(null);

  const handleInput = () => {
    if (editorRef.current) {
      updateState({ textLines: getTextLines(editorRef.current) });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, txt);
  };

  const handleUpdateState = (newState) => {
    if (newState.grid !== undefined && editorRef.current) {
      const DEF_CURSIVE = 'Аа Бб Вв 1 2 3 4 5Пишу красиво и легко.С Точилкой всё сходится!';
      const DEF_PRINT = 'А Б В 1 2 3 4 5ПИШУ КРАСИВО.';
      
      const cleanText = editorRef.current.innerText.replace(/\s+/g, '');
      if (cleanText === DEF_CURSIVE.replace(/\s+/g, '') || cleanText === DEF_PRINT.replace(/\s+/g, '')) {
          editorRef.current.innerHTML = (newState.grid === 'large_squared') 
              ? '<div>А Б В 1 2 3 4 5</div><div><br></div><div>ПИШУ КРАСИВО.</div>' 
              : '<div>Аа Бб Вв 1 2 3 4 5</div><div><br></div><div>Пишу красиво и легко.</div><div><br></div><div>С Точилкой всё сходится!</div>';
          
          newState.textLines = getTextLines(editorRef.current);
      }
    }
    updateState(newState);
  };

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<div>Аа Бб Вв 1 2 3 4 5</div><div><br></div><div>Пишу красиво и легко.</div><div><br></div><div>С Точилкой всё сходится!</div>';
    }
  }, []);

  return (
    <div className="relative flex h-full flex-shrink-0 z-10 w-[clamp(320px,27vw,400px)] min-w-[320px]">
      <aside className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col h-full w-full relative z-[2] overflow-hidden">
        {/* Header */}
        <header className="flex items-center p-4 border-b border-stone-200/50">
          <img
            src="https://raw.githubusercontent.com/onlinetochilka/theme/main/tochilka-logo.svg"
            className="w-11 h-11 mr-3"
            alt="Логотип Точилки"
          />
          <div>
            <h1 className="text-base font-semibold text-stone-900 leading-snug">Идеальная тетрадь</h1>
            <div className="text-xs font-medium text-stone-500">Создавайте прописи и образцы</div>
          </div>
          <button onClick={() => { trackGoal('help_opened'); onOpenHelp(); }} className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            ?
          </button>
        </header>

        {/* Scrollable settings */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <div className="text-sm font-medium text-stone-700 mb-2">Текст для прописей</div>
            <div className="border border-stone-200/50 bg-stone-50/50 rounded-xl p-3 shadow-sm relative">
              <Toolbar editorRef={editorRef} onUpdate={handleInput} />
              <SmartMenu editorRef={editorRef} />
              <div 
                ref={editorRef}
                className="mt-3 min-h-[120px] max-h-[160px] overflow-y-auto outline-none whitespace-pre-wrap break-words" 
                contentEditable="true" 
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
              />
            </div>
          </section>
          <MemoizedOptions 
            format={state.format}
            orientation={state.orientation}
            grid={state.grid}
            mode={state.mode}
            layout={state.layout}
            mathMode={state.mathMode}
            margin={state.margin}
            mirrorMargins={state.mirrorMargins}
            updateState={handleUpdateState}
          />
        </div>

        {/* Footer Actions */}
        <footer className="p-4 border-t border-stone-200/50 bg-stone-50/50 flex flex-col gap-2">
          <button 
            className="w-full h-12 rounded-xl bg-brand-blue text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#005270] shadow-[0_4px_14px_rgba(0,101,132,0.30)] transition-all active:scale-[0.98]"
            onClick={() => { trackGoal('print_click'); trackGoal('download_pdf_click'); alert('Чтобы сохранить файл, в открывшемся окне выберите принтер "Сохранить как PDF" (или "Save as PDF").'); window.print(); }}
          >
            Печать / Сохранить как PDF
          </button>
        </footer>

      </aside>
    </div>
  );
}

export default SidebarSettings;
