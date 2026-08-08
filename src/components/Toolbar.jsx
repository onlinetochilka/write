import React from 'react';
import { trackGoal } from '../utils/analytics';

function Toolbar({ editorRef, onUpdate }) {
  const applyStyle = (type, value) => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      if (type === 'clear' && editorRef.current) {
        editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<\/?span[^>]*>/g, '');
        onUpdate();
      }
      return;
    }
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    const closestSpan = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? range.commonAncestorContainer.closest('span') 
        : range.commonAncestorContainer.parentElement.closest('span');

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

    if (type === 'color') {
      targetSpan.dataset.color = value;
      targetSpan.style.color = value;
    }
    if (type === 'bold') {
      if (value === 'false') {
        delete targetSpan.dataset.bold;
        targetSpan.style.fontWeight = 'normal';
      } else {
        targetSpan.dataset.bold = value;
        targetSpan.style.fontWeight = 'bold';
      }
    }

    try {
      const fragment = range.extractContents();
      const innerSpans = fragment.querySelectorAll('span');
      innerSpans.forEach(span => {
          if (type === 'color') {
              span.dataset.color = value;
              span.style.color = value;
          }
          if (type === 'bold') {
              if (value === 'false') {
                 delete span.dataset.bold;
                 span.style.fontWeight = 'normal';
              } else {
                 span.dataset.bold = value;
                 span.style.fontWeight = 'bold';
              }
          }
      });
      targetSpan.appendChild(fragment);
      range.insertNode(targetSpan);
    } catch (e) {
      return;
    }

    if (type === 'clear') {
      targetSpan.innerHTML = targetSpan.innerHTML.replace(/<\/?span[^>]*>/g, '');
    }
    onUpdate();
  };

  const addAccent = () => {
    trackGoal('accent_clicked');
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    const textNode = document.createTextNode('´');
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    onUpdate();
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
        currentSpan = currentSpan.parentElement.closest('span');
    }
    applyStyle('bold', isBold ? 'false' : 'true');
  };

  const handleUndo = () => {
    document.execCommand('undo');
    onUpdate();
  };

  const handleRedo = () => {
    document.execCommand('redo');
    onUpdate();
  };

  return (
    <div className="flex items-center gap-1 border-b border-stone-200/50 pb-2">
      <button onMouseDown={(e) => e.preventDefault()} onClick={handleUndo} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200" title="Отменить">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
      </button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={handleRedo} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200" title="Повторить">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
      </button>
      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <div className="flex gap-1 pr-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#0F172A')} className="w-5 h-5 rounded-full bg-slate-900 ring-2 ring-offset-1 ring-brand-blue"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#C62828')} className="w-5 h-5 rounded-full bg-red-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#2E7D32')} className="w-5 h-5 rounded-full bg-green-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#1565C0')} className="w-5 h-5 rounded-full bg-blue-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#6A1B9A')} className="w-5 h-5 rounded-full bg-purple-700 hover:scale-110 transition-transform"></button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBold} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold font-serif text-sm">Ж</button>

      <div className="w-px h-5 bg-stone-200 mx-1"></div>

      <div className="flex gap-0.5">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('left')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('center')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="19" y1="12" x2="5" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleAlign('right')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
        </button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1 ml-auto"></div>
      
      <button onMouseDown={(e) => e.preventDefault()} onClick={addAccent} className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium">´</button>
    </div>
  );
}

export default Toolbar;
