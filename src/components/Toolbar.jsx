import React from 'react';

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
    }
    if (inherited.color) {
        targetSpan.dataset.color = inherited.color;
        targetSpan.style.color = inherited.color;
    }

    if (type === 'color') {
      targetSpan.dataset.color = value;
      targetSpan.style.color = value;
    }

    try {
      const fragment = range.extractContents();
      const innerSpans = fragment.querySelectorAll('span');
      innerSpans.forEach(span => {
          if (type === 'color') {
              span.dataset.color = value;
              span.style.color = value;
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

  return (
    <div className="flex items-center gap-2 border-b border-stone-200/50 pb-2">
      <div className="flex gap-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#0F172A')} className="w-6 h-6 rounded-full bg-slate-900 ring-2 ring-offset-1 ring-brand-blue"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#C62828')} className="w-6 h-6 rounded-full bg-red-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#2E7D32')} className="w-6 h-6 rounded-full bg-green-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#1565C0')} className="w-6 h-6 rounded-full bg-blue-700 hover:scale-110 transition-transform"></button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('color', '#6A1B9A')} className="w-6 h-6 rounded-full bg-purple-700 hover:scale-110 transition-transform"></button>
      </div>
      <div className="flex gap-2 items-center ml-auto">
        <div className="w-px h-6 bg-stone-200 mx-1"></div>
        <button onMouseDown={(e) => e.preventDefault()} onClick={addAccent} className="h-8 px-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium">´</button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyStyle('clear')} className="h-8 px-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-sm font-medium">🧹</button>
      </div>
    </div>
  );
}

export default Toolbar;

