import React, { useRef, useEffect, useState } from 'react';
import Toolbar from './Toolbar';
import { useStore } from '../Store';
import { useUI } from '../providers/UIProvider';
import { Tooltip } from './ui/Tooltip';
import { getTextLines } from '../utils/textParser';
import SmartMenu from './SmartMenu';
import { trackGoal } from '../utils/analytics';
import GridOptions from './SidebarSettings/GridOptions';
import ModeSelector from './SidebarSettings/ModeSelector';
import PageSettings from './SidebarSettings/PageSettings';
import InsertOptions from './SidebarSettings/InsertOptions';
import { applyStyleToSelection } from '../utils/textFormatting';
import { PAPER_DIMS } from '../utils/constants';

const MemoizedOptions = React.memo(({ 
  format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, updateState 
}) => {
  return (
    <>
      <GridOptions grid={grid} mathMode={mathMode} updateState={updateState} />
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

const EditorSync = ({ editorRef }) => {
  const { state: editorHtml } = useStore(s => s.editorHtml);
  useEffect(() => {
    if (editorRef.current && editorHtml !== undefined && editorRef.current.innerHTML !== editorHtml) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [editorHtml, editorRef]);
  return null;
};

function SidebarSettings({ onOpenHelp }) {
  const { state, updateState, undo, redo, canUndo, canRedo } = useStore();
  const { showConfirm, showAlert, showToast } = useUI();
  const [activeTab, setActiveTab] = useState('text');
  const editorRef = useRef(null);

  const handleInput = () => {
    if (editorRef.current) {
      updateState({ 
        textLines: getTextLines(editorRef.current),
        editorHtml: editorRef.current.innerHTML
      });
    }
  };

  const handleClearText = () => {
    let savedState = {
      html: editorRef.current.innerHTML,
      lines: state.textLines
    };
    applyStyleToSelection(editorRef, 'clear', null, handleInput);

    showToast('Форматирование очищено', () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = savedState.html;
        handleInput();
      }
    });
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, txt);
  };

  const applyRestOfUpdateState = (finalState, newState) => {
    if (newState.grid !== undefined && editorRef.current) {
      const DEF_CURSIVE = 'Аа Бб Вв 1 2 3 4 5Пишу красиво и легко.С Точилкой всё сходится!';
      const DEF_PRINT = 'А Б В 1 2 3 4 5ПИШУ КРАСИВО.';
      
      const cleanText = editorRef.current.innerText.replace(/\s+/g, '');
      if (cleanText === DEF_CURSIVE.replace(/\s+/g, '') || cleanText === DEF_PRINT.replace(/\s+/g, '')) {
          editorRef.current.innerHTML = '<div>Аа Бб Вв 1 2 3 4 5</div><div><br></div><div>Пишу красиво и легко.</div><div><br></div><div>С Точилкой всё сходится!</div>';
          
          finalState.textLines = getTextLines(editorRef.current);
          finalState.editorHtml = editorRef.current.innerHTML;
      }
    }
    updateState(finalState);
  };

  const handleUpdateState = (newState) => {
    let finalState = { ...newState };

    if ((newState.format && newState.format !== state.format) || 
        (newState.orientation && newState.orientation !== state.orientation)) {
      
      const hasShapes = state.shapes && state.shapes.length > 0;
      if (hasShapes) {
        showConfirm({
          title: 'Масштабировать фигуры?',
          message: 'При изменении формата или ориентации листа вы можете пропорционально изменить размер нарисованных фигур.',
          confirmText: 'Да, пропорционально',
          cancelText: 'Нет, оставить',
          onConfirm: () => {
            const oldFormat = state.format;
            const oldOrientation = state.orientation;
            const oldB = PAPER_DIMS[oldFormat] || PAPER_DIMS.a4;
            const oldW = oldOrientation === 'landscape' ? oldB.h : oldB.w;
            const oldH = oldOrientation === 'landscape' ? oldB.w : oldB.h;

            const newFormat = newState.format || state.format;
            const newOrientation = newState.orientation || state.orientation;
            const newB = PAPER_DIMS[newFormat] || PAPER_DIMS.a4;
            const newW = newOrientation === 'landscape' ? newB.h : newB.w;
            const newH = newOrientation === 'landscape' ? newB.w : newB.h;

            const scaleX = newW / oldW;
            const scaleY = newH / oldH;
            const scaleMin = Math.min(scaleX, scaleY);

            finalState.shapes = state.shapes.map(shape => ({
              ...shape,
              x: shape.x * scaleX,
              y: shape.y * scaleY,
              width: shape.width * scaleX,
              ...(shape.height !== undefined ? { height: shape.height * scaleY } : {}),
              ...(shape.fontSize !== undefined ? { fontSize: shape.fontSize * scaleMin } : {})
            }));
            
            applyRestOfUpdateState(finalState, newState);
          },
          onCancel: () => {
            applyRestOfUpdateState(finalState, newState);
          }
        });
        return;
      }
    }

    applyRestOfUpdateState(finalState, newState);
  };

  const applyInlineStyle = (type, value) => {
    return applyStyleToSelection(editorRef, type, value, handleInput);
  };
  
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<div>Аа Бб Вв 1 2 3 4 5</div><div><br></div><div>Пишу красиво и легко.</div><div><br></div><div>С Точилкой всё сходится!</div>';
    }
  }, []);

  return (
    <div className="relative flex flex-col lg:h-full lg:flex-shrink-0 z-10 w-full lg:w-[clamp(380px,27vw,450px)] lg:min-w-[380px] print:hidden">
      <EditorSync editorRef={editorRef} />
      <aside className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col lg:h-full w-full relative z-[2] lg:overflow-visible">
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
              <span>Создавайте прописи и памятки</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-1">
            <Tooltip content="Отменить действие (Ctrl+Z)" side="top">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={undo}
                disabled={!canUndo}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-stone-600 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Вернуть действие (Ctrl+Y)" side="top">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={redo}
                disabled={!canRedo}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-stone-600 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </Tooltip>
            
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

        {activeTab === 'text' && (
          <div className="px-4 pt-4 pb-0 flex-shrink-0 z-20 relative">
            <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm p-3 flex flex-col gap-2">
              <Toolbar 
                editorRef={editorRef} 
                onUpdate={handleInput} 
                state={state}
                updateState={handleUpdateState}
                applyInlineStyle={applyInlineStyle}
                showToast={showToast}
              />
              <SmartMenu 
                editorRef={editorRef} 
                onClear={handleClearText}
                onUpdate={handleInput}
              />
            </div>
          </div>
        )}

        <div className="flex-1 relative flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'text' ? 'p-4 pt-3' : 'p-4'}`}>
            <div className={activeTab === 'text' ? 'flex-1 flex flex-col gap-5 min-h-[260px]' : 'hidden'}>
              {/* Text Editor Section */}
              <section className="flex-1 flex flex-col">
                <div className="border border-stone-200/50 bg-[#FDFBF7]/80 rounded-xl shadow-sm relative flex flex-col flex-1 focus-within:ring-1 focus-within:ring-[#1D3557]/20 focus-within:border-[#1D3557]/30 transition-colors text-[#1D3557]">
                  <div className="p-3 flex-1">
                    <div 
                      ref={editorRef}
                      className="min-h-[120px] outline-none whitespace-pre-wrap break-words" 
                      contentEditable
                      spellCheck={false}
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
            </div>
            </section>
            </div>

            <div className={activeTab === 'list' ? 'space-y-5 flex flex-col' : 'hidden'}>
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

            <div className={activeTab === 'insert' ? 'space-y-5 flex flex-col' : 'hidden'}>
              <InsertOptions />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-4 border-t border-stone-200/50 bg-stone-50/50 flex flex-col gap-2">
          <button 
            className="w-full h-12 rounded-xl bg-brand-blue text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#005270] shadow-[0_4px_14px_rgba(0,101,132,0.30)] transition-all active:scale-[0.98]"
            onClick={() => { 
              trackGoal('print_click'); 
              trackGoal('download_pdf_click'); 
              const ua = navigator.userAgent || navigator.vendor || window.opera;
              const isTelegram = (ua.indexOf('Telegram') > -1);
              if (isTelegram) {
                showAlert({
                  title: 'Браузер не поддерживается',
                  message: 'Встроенный браузер Telegram не поддерживает сохранение PDF. Пожалуйста, откройте страницу в обычном браузере (Chrome/Safari) через меню (три точки в правом верхнем углу).',
                  type: 'warning'
                });
                return;
              }
              const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
              if (isIOS) {
                  showAlert({
                    title: 'Сохранение PDF',
                    message: 'На iPhone/iPad: нажмите на иконку "Поделиться" и выберите "Напечатать", затем сведите два пальца на предпросмотре, чтобы сохранить как PDF.',
                    type: 'info'
                  });
              } else {
                  showAlert({
                    title: 'Сохранение PDF',
                    message: 'Чтобы сохранить файл, в открывшемся окне выберите принтер "Сохранить как PDF" (или "Save as PDF").',
                    type: 'info'
                  });
              }
              window.print(); 
            }}
          >
            Печать / Сохранить как PDF
          </button>
        </footer>

      </aside>

    </div>
  );
}

export default SidebarSettings;
