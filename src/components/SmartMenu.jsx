import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../Store';
import { getTextLines } from '../utils/textParser';
import { trackGoal } from '../utils/analytics';
import { Tooltip } from './ui/Tooltip';
import { applyStyleToSelection } from '../utils/textFormatting';

function SmartMenu({ editorRef, onClear, onUpdate }) {
  const { updateState } = useStore(() => null);

  const addAccent = () => {
    trackGoal('accent_clicked');
    const sel = window.getSelection();
    if (!sel.rangeCount || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    
    range.collapse(false);
    const textNode = document.createTextNode('\u0301');
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    
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
    applyStyleToSelection(editorRef, 'bold', isBold ? 'false' : 'true', onUpdate);
  };

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
        
        try {
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(targetSpan);
            sel.addRange(newRange);
        } catch(e) {}
    } catch (e) {
        return;
    }

    updateState({ 
      textLines: getTextLines(editorRef.current),
      editorHtml: editorRef.current.innerHTML
    });
  };

  return (
    <div className="flex items-center gap-0.5 w-full">
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip content="подлежащее" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'solid')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-xs"><span className="border-b-2 border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        </Tooltip>
        <Tooltip content="сказуемое" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'double')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-xs"><span className="border-b-[3px] border-double border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        </Tooltip>
        <Tooltip content="дополнение" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dashed')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-xs"><span className="border-b-2 border-dashed border-current pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        </Tooltip>
        <Tooltip content="определение" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'wavy')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-xs"><span className="underline decoration-wavy underline-offset-2 decoration-[1.5px] pb-0.5">&nbsp;&nbsp;&nbsp;</span></button>
        </Tooltip>
        <Tooltip content="обстоятельство" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('ul', 'dotdash')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg width="16" height="1.5" viewBox="0 0 16 1.5" fill="currentColor" className="translate-y-[8px]">
              <rect x="0" y="0" width="5" height="1.5" />
              <rect x="7" y="0" width="2" height="1.5" />
              <rect x="11" y="0" width="5" height="1.5" />
            </svg>
          </button>
        </Tooltip>
      </div>
      
      <div className="w-px h-5 bg-stone-200 mx-0.5 shrink-0"></div>
      
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip content="приставка" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'prefix')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium font-serif text-sm">¬</button>
        </Tooltip>
        <Tooltip content="корень" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'root')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium font-serif text-sm">⌒</button>
        </Tooltip>
        <Tooltip content="суффикс" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'suffix')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium font-serif text-sm">^</button>
        </Tooltip>
        <Tooltip content="окончание" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('morph', 'ending')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium font-serif text-sm">□</button>
        </Tooltip>
        <Tooltip content="основа" side="top">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('base', 'toggle')} className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg width="14" height="6" viewBox="0 0 14 6" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="translate-y-[5px]">
              <path d="M1 1v4h12V1" />
            </svg>
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-0.5 shrink-0"></div>
      
      <Tooltip content="Ударение" side="top">
        <button onMouseDown={(e) => e.preventDefault()} onClick={addAccent} className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium">´</button>
      </Tooltip>

      <div className="w-px h-5 bg-stone-200 ml-auto mr-0.5 shrink-0"></div>

      <Tooltip content="Жирный" side="top">
        <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBold} className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold font-serif text-sm">Ж</button>
      </Tooltip>

      <div className="w-px h-5 bg-stone-200 mx-0.5 shrink-0"></div>

      <Tooltip content="Очистить форматирование" side="top">
        <button 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={onClear} 
          className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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

export default SmartMenu;
