import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';
import { trackGoal } from '../utils/analytics';

function SmartMenu({ editorRef }) {
  const { updateState } = useStore();

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
    let inherited = { morph: null, ul: null, color: null, morphId: null, base: null, baseId: null };
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
        currentSpan = currentSpan.parentElement.closest('span');
    }

    const targetSpan = document.createElement('span');
    
    if (inherited.ul) targetSpan.dataset.ul = inherited.ul;
    if (inherited.morph) {
        targetSpan.dataset.morph = inherited.morph;
        if (inherited.morphId) targetSpan.dataset.morphId = inherited.morphId;
        targetSpan.style.backgroundColor = 'rgba(46,125,50,0.1)';
    }
    if (inherited.base) {
        targetSpan.dataset.base = inherited.base;
        if (inherited.baseId) targetSpan.dataset.baseId = inherited.baseId;
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
    } else if (type === 'base') {
        const isCurrentlyBase = inherited.base === 'true';
        if (isCurrentlyBase) {
           delete targetSpan.dataset.base;
           delete targetSpan.dataset.baseId;
        } else {
           targetSpan.dataset.base = 'true';
           targetSpan.dataset.baseId = Date.now().toString() + Math.random().toString().slice(2, 6);
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
            if (type === 'base') {
                const isCurrentlyBase = inherited.base === 'true';
                if (isCurrentlyBase) {
                    delete span.dataset.base;
                    delete span.dataset.baseId;
                } else {
                    span.dataset.base = 'true';
                    span.dataset.baseId = targetSpan.dataset.baseId;
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

  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 border border-stone-200">
      <div className="flex items-center gap-0.5">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'solid')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-bold text-xs transition-colors"><span className="border-b-2 border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'double')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-bold text-xs transition-colors"><span className="border-b border-current pb-0.5 shadow-[0_3px_0_0_currentColor]">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dashed')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-bold text-xs transition-colors"><span className="border-b-2 border-dashed border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dotdash')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-bold text-xs transition-colors"><span className="border-b-2 border-dotted border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'wavy')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-bold text-xs transition-colors"><span className="underline decoration-wavy underline-offset-2 decoration-[1.5px] pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
      </div>
      <div className="w-[1px] h-5 bg-stone-300 mx-1"></div>
      <div className="flex items-center gap-0.5">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'prefix')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-medium font-serif text-sm transition-colors">¬</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'root')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-medium font-serif text-sm transition-colors">⌒</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'suffix')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-medium font-serif text-sm transition-colors">^</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'ending')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-medium font-serif text-sm transition-colors">□</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('base', 'toggle')} className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-white flex items-center justify-center font-medium font-serif text-sm transition-colors">_</button>
      </div>
    </div>
  );
}

export default SmartMenu;
