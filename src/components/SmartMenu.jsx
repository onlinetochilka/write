import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';

function SmartMenu({ editorRef }) {
  const { updateState } = useStore();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const showMenu = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      setVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setVisible(false);
      return;
    }

    const containerRect = editorRef.current.parentElement.getBoundingClientRect();
    
    let top = rect.top - 55;
    // Если меню налезает на тулбар (который находится в самом верху контейнера, примерно 45px высотой)
    // или уходит за верхний край экрана, переносим его под выделенный текст
    if (top < containerRect.top + 45 || top < 10) {
      top = rect.bottom + 10;
    }

    let left = rect.left + (rect.width / 2) - 100;
    if (left < 10) left = 10;
    
    setPos({ top, left });
    setVisible(true);
  };

  useEffect(() => {
    const handleMouseUp = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setTimeout(showMenu, 10);
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
        setTimeout(showMenu, 10);
      }
    };
    
    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && editorRef.current && !editorRef.current.contains(e.target)) {
        setVisible(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editorRef]);

  const applyStyle = (type, value) => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    // Remove empty spaces from selection edges
    while (range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset > 0 && range.endContainer.textContent[range.endOffset - 1].match(/\s/)) {
      range.setEnd(range.endContainer, range.endOffset - 1);
    }
    while (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset < range.startContainer.length && range.startContainer.textContent[range.startOffset].match(/\s/)) {
      range.setStart(range.startContainer, range.startOffset + 1);
    }
    if (range.collapsed) return;

    const closestSpan = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
        ? range.commonAncestorContainer.closest('span') 
        : range.commonAncestorContainer.parentElement.closest('span');

    let currentSpan = closestSpan;
    let inherited = { morph: null, ul: null, color: null, morphId: null };
    while (currentSpan && currentSpan.tagName === 'SPAN') {
        if (!inherited.morph && currentSpan.dataset.morph) {
            inherited.morph = currentSpan.dataset.morph;
            inherited.morphId = currentSpan.dataset.morphId;
        }
        if (!inherited.ul && currentSpan.dataset.ul) inherited.ul = currentSpan.dataset.ul;
        if (!inherited.color && currentSpan.dataset.color) inherited.color = currentSpan.dataset.color;
        currentSpan = currentSpan.parentElement.closest('span');
    }

    const targetSpan = document.createElement('span');
    
    if (inherited.ul) targetSpan.dataset.ul = inherited.ul;
    if (inherited.morph) {
        targetSpan.dataset.morph = inherited.morph;
        if (inherited.morphId) targetSpan.dataset.morphId = inherited.morphId;
        targetSpan.style.backgroundColor = 'rgba(46,125,50,0.1)';
    }
    if (inherited.color) {
        targetSpan.dataset.color = inherited.color;
        targetSpan.style.color = inherited.color;
    }

    if (type === 'ul') {
        targetSpan.dataset.ul = value;
    } else if (type === 'morph') {
        targetSpan.dataset.morph = value;
        if (value !== 'none') {
            targetSpan.dataset.morphId = Date.now().toString() + Math.random().toString().slice(2, 6);
            targetSpan.style.backgroundColor = 'rgba(46,125,50,0.1)';
        } else {
            delete targetSpan.dataset.morphId;
            targetSpan.style.backgroundColor = '';
        }
    }

    try {
        const fragment = range.extractContents();
        const innerSpans = fragment.querySelectorAll('span');
        innerSpans.forEach(span => {
            if (type === 'ul') span.dataset.ul = value;
            if (type === 'morph') {
                span.dataset.morph = value;
                if (value !== 'none') {
                    span.dataset.morphId = targetSpan.dataset.morphId;
                    span.style.backgroundColor = 'rgba(46,125,50,0.1)';
                } else {
                    delete span.dataset.morphId;
                    span.style.backgroundColor = '';
                }
            }
        });
        targetSpan.appendChild(fragment);
        range.insertNode(targetSpan);
    } catch (e) {
        return;
    }

    updateState({ textLines: getTextLines(editorRef.current) });
  };

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] flex items-center p-1 bg-[#e0e5ec] rounded-2xl shadow-[4px_4px_12px_#b8c2d1,-4px_-4px_12px_#ffffff] gap-1"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-center gap-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'solid')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-bold text-xs"><span className="border-b-2 border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'double')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-bold text-xs"><span className="border-b border-current pb-0.5 shadow-[0_3px_0_0_currentColor]">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dashed')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-bold text-xs"><span className="border-b-2 border-dashed border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dotdash')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-bold text-xs"><span className="border-b-2 border-dotted border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'wavy')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-bold text-xs"><span className="underline decoration-wavy underline-offset-2 decoration-[1.5px] pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
      </div>
      <div className="w-[2px] h-4 bg-[#b8c2d1] rounded-[1px] shadow-[1px_1px_2px_#ffffff] mx-0.5"></div>
      <div className="flex items-center gap-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'prefix')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-medium font-serif text-sm">¬</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'root')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-medium font-serif text-sm">⌒</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'suffix')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-medium font-serif text-sm">^</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'ending')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-medium font-serif text-sm">□</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'base')} className="w-8 h-8 rounded-xl bg-[#e0e5ec] text-stone-500 hover:text-stone-800 shadow-[3px_3px_8px_#b8c2d1,-3px_-3px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#b8c2d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center font-medium font-serif text-sm">_</button>
      </div>
    </div>
  );
}

export default SmartMenu;
