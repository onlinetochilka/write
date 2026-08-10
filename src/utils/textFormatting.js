export const applyStyleToSelection = (editorRef, type, value, onUpdate) => {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) {
    if (type === 'clear' && editorRef.current) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<\/?span[^>]*>/g, '');
      if (onUpdate) onUpdate();
    }
    return false;
  }
  
  const range = sel.getRangeAt(0);
  if (!editorRef.current.contains(range.commonAncestorContainer)) return false;

  const closestSpan = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE 
      ? range.commonAncestorContainer.closest('span') 
      : range.commonAncestorContainer.parentElement?.closest('span');

  let currentSpan = closestSpan;
  let inherited = { morph: null, ul: null, color: null, bg: null, morphId: null, bold: null, font: null, fs: null, base: null, baseId: null };
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
      if (!inherited.bg && currentSpan.dataset.bg) inherited.bg = currentSpan.dataset.bg;
      if (!inherited.bold && currentSpan.dataset.bold) inherited.bold = currentSpan.dataset.bold;
      if (!inherited.font && currentSpan.dataset.font) inherited.font = currentSpan.dataset.font;
      if (!inherited.fs && currentSpan.dataset.fs) inherited.fs = currentSpan.dataset.fs;
      currentSpan = currentSpan.parentElement?.closest('span');
  }

  const targetSpan = document.createElement('span');

  if (type !== 'clear') {
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
    if (inherited.bg) {
        targetSpan.dataset.bg = inherited.bg;
        targetSpan.style.backgroundColor = inherited.bg;
    }
    if (inherited.bold && inherited.bold !== 'false') {
        targetSpan.dataset.bold = inherited.bold;
        targetSpan.style.fontWeight = 'bold';
    }
    if (inherited.font) {
        targetSpan.dataset.font = inherited.font;
        targetSpan.style.fontFamily = inherited.font === 'ClassRoomCursive' ? "'ClassRoomCursive', 'Propisi', cursive" : inherited.font;
    }
    if (inherited.fs) {
        targetSpan.dataset.fs = inherited.fs;
    }
  }

  if (type === 'color') {
    targetSpan.dataset.color = value;
    targetSpan.style.color = value;
  }
  if (type === 'bg') {
    targetSpan.dataset.bg = value;
    targetSpan.style.backgroundColor = value;
  }
  if (type === 'bold') {
    targetSpan.dataset.bold = value;
    targetSpan.style.fontWeight = value === 'false' ? 'normal' : 'bold';
  }
  if (type === 'font') {
    targetSpan.dataset.font = value;
    targetSpan.style.fontFamily = value === 'ClassRoomCursive' ? "'ClassRoomCursive', 'Propisi', cursive" : value;
  }
  if (type === 'fs') {
    targetSpan.dataset.fs = value;
  }

  try {
    const fragment = range.extractContents();
    const innerSpans = fragment.querySelectorAll('span');
    innerSpans.forEach(span => {
        if (type === 'color') {
            span.dataset.color = value;
            span.style.color = value;
        }
        if (type === 'bg') {
            span.dataset.bg = value;
            span.style.backgroundColor = value;
        }
        if (type === 'bold') {
            span.dataset.bold = value;
            span.style.fontWeight = value === 'false' ? 'normal' : 'bold';
        }
        if (type === 'font') {
            span.dataset.font = value;
            span.style.fontFamily = value === 'ClassRoomCursive' ? "'ClassRoomCursive', 'Propisi', cursive" : value;
        }
        if (type === 'fs') {
            span.dataset.fs = value;
        }
    });
    targetSpan.appendChild(fragment);
    range.insertNode(targetSpan);
  } catch (e) {
    return false;
  }

  if (type === 'clear') {
    targetSpan.innerHTML = targetSpan.innerHTML.replace(/<\/?span[^>]*>/g, '');
  }
  
  try {
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(targetSpan);
    sel.addRange(newRange);
  } catch(e) {}
  
  if (onUpdate) onUpdate();
  return true;
};
