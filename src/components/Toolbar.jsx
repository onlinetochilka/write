import React from 'react';
import { Tooltip } from './ui/Tooltip';
import { ColorPopover } from './ui/ColorPopover';
import { Pencil, Highlighter } from 'lucide-react';
import { trackGoal } from '../utils/analytics';

import { applyStyleToSelection } from '../utils/textFormatting';

function Toolbar({ editorRef, onUpdate, state, updateState, applyInlineStyle, showToast }) {
  const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const applyStyle = (type, value) => {
    applyStyleToSelection(editorRef, type, value, onUpdate);
  };

  const toggleAlign = (alignValue) => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    let block = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

    if (block === editorRef.current) {
       // If the user selected everything, applying align to all children
       Array.from(editorRef.current.children).forEach(child => {
           if (child.tagName === 'DIV' || child.tagName === 'P') {
               child.style.textAlign = alignValue;
           }
       });
    } else {
       const closestBlock = block.closest('div, p');
       if (closestBlock && closestBlock !== editorRef.current) {
           closestBlock.style.textAlign = alignValue;
       } else if (closestBlock === editorRef.current) {
           // We need to wrap the text in a div if it's naked text
           document.execCommand('formatBlock', false, 'DIV');
           const newBlock = window.getSelection().anchorNode.parentElement.closest('div, p');
           if (newBlock && newBlock !== editorRef.current) {
               newBlock.style.textAlign = alignValue;
           }
       }
    }
    onUpdate();
  };

  return (
    <div className="flex items-center gap-1 border-b border-stone-200/50 pb-2">
      <div className="flex gap-1 pr-1">
        <ColorPopover
          icon={Pencil}
          tooltip="Цвет текста"
          onSelect={(c) => applyStyle('color', c)}
          onClear={() => applyStyle('color', '')}
        />
        <ColorPopover
          icon={Highlighter}
          tooltip="Маркер"
          onSelect={(c) => applyStyle('bg', hexToRgba(c, 0.3))}
          onClear={() => applyStyle('bg', '')}
          clearLabel="Без заливки"
        />
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <div className="flex gap-0.5">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('left')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('center')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="19" y1="12" x2="5" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('right')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1 ml-auto"></div>
      
      {/* Font Toggle (Segmented Control) */}
      <Tooltip content="Шрифт (Рукописный / Печатный)" side="top">
        <div className="flex bg-stone-100/80 p-0.5 rounded-lg shrink-0">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const applied = applyInlineStyle('font', 'ClassRoomCursive');
              if (!applied) {
                const oldFont = state.printFont;
                updateState({ printFont: 'ClassRoomCursive' });
                showToast('Изменен базовый шрифт.', () => updateState({ printFont: oldFont }));
              }
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${state.printFont === 'ClassRoomCursive' ? 'bg-white text-stone-900 shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <span className="font-serif italic font-bold text-[14px] pr-[1px]">Аа</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const applied = applyInlineStyle('font', 'Bahnschrift');
              if (!applied) {
                const oldFont = state.printFont;
                updateState({ printFont: 'Bahnschrift' });
                showToast('Изменен базовый шрифт.', () => updateState({ printFont: oldFont }));
              }
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${state.printFont !== 'ClassRoomCursive' ? 'bg-white text-stone-900 shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <span className="font-sans font-bold text-[12px]">Аа</span>
          </button>
        </div>
      </Tooltip>
      
      {/* Mode Toggle (Segmented Control) */}
      <Tooltip content="Буквы (Светлые / Тёмные)" side="top">
        <div className="flex bg-stone-100/80 p-0.5 rounded-lg shrink-0 ml-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateState({ mode: 'tracing' })}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${state.mode === 'tracing' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-stone-200/50'}`}
          >
            <span className="font-sans font-bold text-[12px] text-stone-300">Аа</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateState({ mode: 'copy' })}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${state.mode !== 'tracing' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-stone-200/50'}`}
          >
            <span className="font-sans font-bold text-[12px] text-stone-900">Аа</span>
          </button>
        </div>
      </Tooltip>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      {/* Font Size Stepper */}
      <Tooltip content="Размер шрифта" side="top">
        <div className="flex items-center bg-stone-100/80 rounded-md shrink-0">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              let newFs = Math.max(2, (parseFloat(state.printFontSize) || 18) - 1);
              const applied = applyInlineStyle('fs', newFs);
              if (!applied) {
                const oldFs = state.printFontSize;
                updateState({ printFontSize: newFs });
                showToast('Изменен базовый размер.', () => updateState({ printFontSize: oldFs }));
              }
            }}
            className="w-5 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          
          <input
            type="number"
            min="2" max="100" step="0.5"
            value={Math.round(state.printFontSize || 18)}
            onChange={(e) => {
              let newFs = parseFloat(e.target.value);
              if (isNaN(newFs)) return;
              if (newFs < 2) newFs = 2;
              if (newFs > 100) newFs = 100;
              const applied = applyInlineStyle('fs', newFs);
              if (!applied) {
                const oldFs = state.printFontSize;
                updateState({ printFontSize: newFs });
                showToast('Изменен базовый размер.', () => updateState({ printFontSize: oldFs }));
              }
            }}
            className="w-8 text-center text-[11px] font-bold text-stone-700 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue/20 rounded py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              let newFs = Math.min(100, (parseFloat(state.printFontSize) || 18) + 1);
              const applied = applyInlineStyle('fs', newFs);
              if (!applied) {
                const oldFs = state.printFontSize;
                updateState({ printFontSize: newFs });
                showToast('Изменен базовый размер.', () => updateState({ printFontSize: oldFs }));
              }
            }}
            className="w-5 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </Tooltip>
    </div>
  );
}

export default Toolbar;
