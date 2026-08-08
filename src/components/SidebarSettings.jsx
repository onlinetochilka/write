import React, { useRef, useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';
import SmartMenu from './SmartMenu';
import { trackGoal } from '../utils/analytics';
import GridOptions from './SidebarSettings/GridOptions';
import ModeSelector from './SidebarSettings/ModeSelector';
import PageSettings from './SidebarSettings/PageSettings';
import InsertOptions from './SidebarSettings/InsertOptions';

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
  const { state, updateState, undo, redo, canUndo, canRedo } = useStore();
  const editorRef = useRef(null);

  const handleInput = () => {
    if (editorRef.current) {
      updateState({ 
        textLines: getTextLines(editorRef.current),
        editorHtml: editorRef.current.innerHTML
      });
    }
  };

  const clearText = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<\/?span[^>]*>/g, '');
      handleInput();
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

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, onUndo) => {
    setToast({ message, onUndo });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const applyInlineStyle = (type, value) => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return false;
    
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return false;

    const closestSpan = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? range.commonAncestorContainer.closest('span') 
        : range.commonAncestorContainer.parentElement?.closest('span');
    
    let currentSpan = closestSpan;
    let inherited = { morph: null, ul: null, color: null, morphId: null, bold: null, font: null, fs: null, base: null, baseId: null };
    while (currentSpan && currentSpan.tagName === 'SPAN') {
        if (!inherited.morph && currentSpan.dataset.morph) {
            inherited.morph = currentSpan.dataset.morph;
            inherited.morphId = currentSpan.dataset.morphId;
        }
        if (!inherited.base && currentSpan.dataset.base) {
            inherited.base = currentSpan.dataset.base;
            inherited.baseId = currentSpan.dataset.baseId;
        }
        if (!inherited.ul && currentSpan.dataset.ul) inherited.ul = currentSpan.dataset.ul;
        if (!inherited.color && currentSpan.dataset.color) inherited.color = currentSpan.dataset.color;
        if (!inherited.bold && currentSpan.dataset.bold) inherited.bold = currentSpan.dataset.bold;
        if (!inherited.font && currentSpan.dataset.font) inherited.font = currentSpan.dataset.font;
        if (!inherited.fs && currentSpan.dataset.fs) inherited.fs = currentSpan.dataset.fs;
        currentSpan = currentSpan.parentElement.closest('span');
    }

    const targetSpan = document.createElement('span');

    if (inherited.ul) targetSpan.dataset.ul = inherited.ul;
    if (inherited.morph) {
        targetSpan.dataset.morph = inherited.morph;
        if (inherited.morphId) targetSpan.dataset.morphId = inherited.morphId;
    }
    if (inherited.base) {
        targetSpan.dataset.base = inherited.base;
        if (inherited.baseId) targetSpan.dataset.baseId = inherited.baseId;
    }
    if (inherited.color) {
        targetSpan.dataset.color = inherited.color;
        targetSpan.style.color = inherited.color;
    }
    if (inherited.bold && inherited.bold !== 'false') {
        targetSpan.dataset.bold = inherited.bold;
        targetSpan.style.fontWeight = 'bold';
    }
    if (inherited.font) targetSpan.dataset.font = inherited.font;
    if (inherited.fs) targetSpan.dataset.fs = inherited.fs;

    if (type === 'font') targetSpan.dataset.font = value;
    if (type === 'fs') targetSpan.dataset.fs = value;

    try {
      const fragment = range.extractContents();
      const innerSpans = fragment.querySelectorAll('span');
      innerSpans.forEach(span => {
          if (type === 'font') span.dataset.font = value;
          if (type === 'fs') span.dataset.fs = value;
      });
      targetSpan.appendChild(fragment);
      range.insertNode(targetSpan);
    } catch (e) {
      return false;
    }
    handleInput();
    return true;
  };

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'list'
  
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<div>Аа Бб Вв 1 2 3 4 5</div><div><br></div><div>Пишу красиво и легко.</div><div><br></div><div>С Точилкой всё сходится!</div>';
    }
  }, []);
  useEffect(() => {
    if (editorRef.current && state.editorHtml !== undefined && editorRef.current.innerHTML !== state.editorHtml) {
      editorRef.current.innerHTML = state.editorHtml;
    }
  }, [state.editorHtml]);


  return (
    <div className="relative flex h-full flex-shrink-0 z-10 w-[clamp(380px,27vw,450px)] min-w-[380px]">
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
            <div className="text-xs font-medium text-stone-500 flex gap-2 items-center">
              <span>Создавайте прописи и образцы</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-1">
            <button 
              onClick={undo} 
              disabled={!canUndo}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${canUndo ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-transparent text-stone-300'}`} 
              title="Отменить действие (Ctrl+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            </button>
            <button 
              onClick={redo} 
              disabled={!canRedo}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${canRedo ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-transparent text-stone-300'}`} 
              title="Вернуть действие (Ctrl+Y)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            </button>
            
            <div className="w-px h-5 bg-stone-200 mx-1"></div>
            
            <button onClick={() => { trackGoal('help_opened'); onOpenHelp(); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
              ?
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-stone-200/50 bg-stone-100/60">
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'text' ? 'text-brand-blue border-b-2 border-brand-blue bg-white' : 'text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:bg-stone-200/40 shadow-[inset_0_-4px_6px_-4px_rgba(0,0,0,0.05)]'}`}
            onClick={() => setActiveTab('text')}
          >
            Текст
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'list' ? 'text-brand-blue border-b-2 border-brand-blue bg-white' : 'text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:bg-stone-200/40 shadow-[inset_0_-4px_6px_-4px_rgba(0,0,0,0.05)]'}`}
            onClick={() => setActiveTab('list')}
          >
            Лист
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'insert' ? 'text-brand-blue border-b-2 border-brand-blue bg-white' : 'text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:bg-stone-200/40 shadow-[inset_0_-4px_6px_-4px_rgba(0,0,0,0.05)]'}`}
            onClick={() => setActiveTab('insert')}
          >
            Вставка
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 relative space-y-5 scrollbar-hide">
          
          {activeTab === 'text' && (
            <>
              {/* Text Editor Section */}
              <section>
                <div className="flex items-center justify-between mb-2 relative">
                  <div className="text-sm font-medium text-stone-700">Текст для прописей</div>
                  
                  {toast && (
                    <div className="absolute top-0 right-0 left-0 -mt-1 bg-blue-50 border border-brand-blue/30 text-brand-blue rounded-lg p-2 text-xs flex items-center justify-between shadow-sm animate-fade-in z-20 backdrop-blur-sm bg-blue-50/95">
                      <span className="flex-1 pr-2 truncate">{toast.message}</span>
                      <button 
                        onClick={() => { toast.onUndo(); setToast(null); }}
                        className="font-semibold whitespace-nowrap hover:underline px-2 py-1 bg-brand-blue/10 rounded"
                      >
                        Отменить
                      </button>
                    </div>
                  )}

                  <button 
                    onMouseDown={(e) => e.preventDefault()} 
                    onClick={clearText} 
                    title="Очистить форматирование"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                      <line x1="18" y1="9" x2="12" y2="15"></line>
                      <line x1="12" y1="9" x2="18" y2="15"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="border border-stone-200/50 bg-stone-50/50 rounded-xl p-3 shadow-sm relative flex flex-col gap-2">
                  <Toolbar 
                    editorRef={editorRef} 
                    onUpdate={handleInput} 
                  />
                  <SmartMenu editorRef={editorRef} />
                  <div 
                    ref={editorRef}
                    className="mt-3 min-h-[240px] max-h-[400px] overflow-y-auto outline-none whitespace-pre-wrap break-words custom-scrollbar" 
                    contentEditable 
                    suppressContentEditableWarning
                    onPaste={handlePaste}
                    onInput={handleInput}
                    style={{ 
                      fontFamily: state.printFont === 'ClassRoomCursive' ? "'ClassRoomCursive', 'Propisi', cursive" : state.printFont,
                      fontSize: state.printFont === 'ClassRoomCursive' ? '28px' : '18px',
                      lineHeight: '1.4'
                    }}
                  ></div>
                </div>
              </section>

              {/* Font Section */}
              <section>
                <div className="text-sm font-medium text-stone-700 mb-2 uppercase tracking-wider text-xs">Шрифт</div>
                <div className="flex items-center gap-3 bg-stone-50/50 border border-stone-200/50 rounded-xl p-3">
                  <select 
                    value={state.printFont}
                    onChange={(e) => {
                      const newFont = e.target.value;
                      const applied = applyInlineStyle('font', newFont);
                      if (!applied) {
                        const oldFont = state.printFont;
                        updateState({ printFont: newFont });
                        showToast('Изменен базовый шрифт.', () => updateState({ printFont: oldFont }));
                      }
                    }}
                    className="flex-1 min-w-[120px] bg-white border border-stone-200 text-stone-700 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block p-2 outline-none"
                  >
                    <option value="PT Sans">PT Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Arial">Arial</option>
                    <option value="ClassRoomCursive">Рукописный</option>
                  </select>
                  <div className={`flex items-center gap-2 flex-1 transition-opacity duration-200 ${state.printFont === 'ClassRoomCursive' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <span className="text-[10px] text-stone-500 font-medium">Размер</span>
                    <input 
                      type="range" 
                      min="2" max="100" step="0.5"
                      value={state.printFontSize} 
                      onChange={(e) => {
                        const newFs = parseFloat(e.target.value);
                        const applied = applyInlineStyle('fs', newFs);
                        if (!applied) {
                          const oldFs = state.printFontSize;
                          updateState({ printFontSize: newFs });
                          showToast('Изменен базовый размер.', () => updateState({ printFontSize: oldFs }));
                        }
                      }}
                      className="w-full accent-brand-blue h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'list' && (
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
          )}

          {activeTab === 'insert' && (
            <InsertOptions />
          )}
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
