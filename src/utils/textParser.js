export function getTextLines(editorEl) {
  if (!editorEl) return [{ chunks: [], align: 'left' }];
  
  let lines = [];
  let currentLineChunks = [];
  let currentAlign = 'left';

  function traverse(node, currentColor = null, currentBg = null, currentUl = null, currentUlColor = null, currentMorph = 'none', currentMorphId = null, currentBold = false, currentFont = null, currentFs = null, currentBase = false, currentBaseId = null) {
      if (node.nodeType === Node.TEXT_NODE) {
          const cleanText = node.textContent.replace(/\n/g, '').replace(/\u00A0/g, ' ').replace(/\u200B/g, '');
          if (cleanText) {
              currentLineChunks.push({
                  text: cleanText,
                  color: currentColor,
                  bg: currentBg,
                  ul: currentUl,
                  ulColor: currentUlColor !== null ? currentUlColor : currentColor,
                  morph: currentMorph || 'none',
                  morphId: currentMorphId,
                  bold: currentBold,
                  font: currentFont,
                  fs: currentFs,
                  base: currentBase,
                  baseId: currentBaseId
              });
          }
          return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.nodeName;
          
          if (tag === 'BR') {
              lines.push({ chunks: currentLineChunks, align: currentAlign });
              currentLineChunks = [];
              return;
          }

          const isBlock = tag === 'DIV' || tag === 'P';
          if (isBlock) {
             const align = node.style?.textAlign || 'left';
             if (currentLineChunks.length > 0) {
                 lines.push({ chunks: currentLineChunks, align: currentAlign });
                 currentLineChunks = [];
             }
             currentAlign = align;
          }

          const newColor = node.dataset?.color || currentColor;
          const newBg = node.dataset?.bg || currentBg;
          const newUl = node.dataset?.ul || currentUl;
          const newUlColor = node.dataset?.ulColor || currentUlColor;
          const newMorph = node.dataset?.morph || currentMorph;
          const newMorphId = node.dataset?.morphId || currentMorphId;
          let newBold = currentBold;
          if (node.dataset?.bold === 'true') newBold = true;
          else if (node.dataset?.bold === 'false') newBold = false;
          const newFont = node.dataset?.font || currentFont;
          const newFs = node.dataset?.fs ? parseFloat(node.dataset.fs) : currentFs;
          const newBase = node.dataset?.base === 'true' || currentBase;
          const newBaseId = node.dataset?.baseId || currentBaseId;

          node.childNodes.forEach(child => traverse(child, newColor, newBg, newUl, newUlColor, newMorph, newMorphId, newBold, newFont, newFs, newBase, newBaseId));

          if (isBlock) {
              if (currentLineChunks.length > 0) {
                  lines.push({ chunks: currentLineChunks, align: currentAlign });
                  currentLineChunks = [];
              } else if (node.childNodes.length === 0) {
                  lines.push({ chunks: [], align: currentAlign });
              }
              currentAlign = 'left';
          }
      }
  }

  editorEl.childNodes.forEach(child => traverse(child, null, null, null, null, 'none', null, false, null, null, false, null));

  if (currentLineChunks.length > 0) {
      lines.push({ chunks: currentLineChunks, align: currentAlign });
  }

  const optimizedLines = lines.map(lineData => {
      const merged = [];
      for (const chunk of lineData.chunks) {
          if (!chunk.text) continue;
          const last = merged[merged.length - 1];
          
          if (last) {
              const isSameStyle = last.color === chunk.color && last.bg === chunk.bg && last.ul === chunk.ul && last.ulColor === chunk.ulColor && last.bold === chunk.bold && last.font === chunk.font && last.fs === chunk.fs;
              const isSameMorph = last.morph === chunk.morph && (last.morphId === chunk.morphId || chunk.morph === 'ending' || chunk.morph === 'none');
              const isSameBase = last.base === chunk.base;
              
              if (isSameStyle && isSameMorph && isSameBase) {
                  last.text += chunk.text;
                  continue;
              }
          }
          merged.push({ ...chunk });
      }
      return { chunks: merged, align: lineData.align };
  });

  return optimizedLines.length ? optimizedLines : [{ chunks: [], align: 'left' }];
}
