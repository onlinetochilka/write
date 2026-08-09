import React from 'react';
import { Tooltip } from './ui/Tooltip';
import { trackGoal } from '../utils/analytics';

import { applyStyleToSelection } from '../utils/textFormatting';

function Toolbar({ editorRef, onUpdate, onClear, onUndo, onRedo }) {
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

  const toggleBold = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const closestSpan = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? range.commonAncestorContainer.closest('span') 
        : range.commonAncestorContainer.parentElement?.closest('span');
    
    let isBold = false;
    let currentSpan = closestSpan;
    while (currentSpan && currentSpan.tagName === 'SPAN') {
        if (currentSpan.dataset.bold === 'true') {
            isBold = true;
            break;
        }
        if (currentSpan.dataset.bold === 'false') {
            isBold = false;
            break;
        }
        currentSpan = currentSpan.parentElement.closest('span');
    }
    applyStyle('bold', isBold ? 'false' : 'true');
  };

  const handleUndo = () => {
    if (onUndo) onUndo();
    else document.execCommand('undo');
  };

  const handleRedo = () => {
    if (onRedo) onRedo();
    else document.execCommand('redo');
  };

  return (
    <div className="flex items-center gap-1 border-b border-stone-200/50 pb-2">
      <Tooltip content="Отменить" side="top">
        <button onMouseDown={(e) => e.preventDefault()} onClick={handleUndo} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
        </button>
      </Tooltip>
      <Tooltip content="Повторить" side="top">
        <button onMouseDown={(e) => e.preventDefault()} onClick={handleRedo} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
        </button>
      </Tooltip>
      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <div className="flex gap-1 pr-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#0F172A')} className="w-5 h-5 rounded-full bg-slate-900 ring-2 ring-offset-1 ring-brand-blue"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#C62828')} className="w-5 h-5 rounded-full bg-red-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#2E7D32')} className="w-5 h-5 rounded-full bg-green-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#1565C0')} className="w-5 h-5 rounded-full bg-blue-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#6A1B9A')} className="w-5 h-5 rounded-full bg-purple-700 hover:scale-110 transition-transform"></button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBold} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold font-serif text-sm">Ж</button>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <div className="flex gap-0.5">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('left')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('center')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="19" y1="12" x2="5" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('right')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1 ml-auto"></div>
      
      <Tooltip content="Очистить форматирование" side="top">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onClear} 
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}

export default Toolbar;
