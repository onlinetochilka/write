import React, { useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';
import SmartMenu from './SmartMenu';
import { trackGoal } from '../utils/analytics';
import GridOptions from './SidebarSettings/GridOptions';
import ModeSelector from './SidebarSettings/ModeSelector';
import PageSettings from './SidebarSettings/PageSettings';

const MemoizedOptions = React.memo(({ 
  format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, updateState 
}) => {
  return (
    <>
      <GridOptions grid={grid} mathMode={mathMode} updateState={updateState} />
      <ModeSelector mode={mode} updateState={updateState} />
      <PageSettings 
        format={format} 
        orientation={orientation} 
        margin={margin} 
        layout={layout} 
        mirrorMargins={mirrorMargins} 
        updateState={updateState} 
      />
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
