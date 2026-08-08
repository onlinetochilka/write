export function getTextLines(editorEl) {
  if (!editorEl) return [[]];
  
  let lines = [];
  let currentLineChunks = [];

  function traverse(node, currentColor = null, currentUl = null, currentUlColor = null, currentMorph = 'none', currentMorphId = null) {
      if (node.nodeType === Node.TEXT_NODE) {
          const cleanText = node.textContent.replace(/\n/g, '');
          if (cleanText) {
              currentLineChunks.push({
                  text: cleanText,
                  color: currentColor,
                  ul: currentUl,
                  ulColor: currentUlColor !== null ? currentUlColor : currentColor,
                  morph: currentMorph || 'none',
                  morphId: currentMorphId
              });
          }
          return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.nodeName;
          
          if (tag === 'BR') {
              lines.push(currentLineChunks);
              currentLineChunks = [];
              return;
          }

          const isBlock = tag === 'DIV' || tag === 'P';
          if (isBlock && currentLineChunks.length > 0) {
              lines.push(currentLineChunks);
              currentLineChunks = [];
          }

          const newColor = node.dataset?.color || currentColor;
          const newUl = node.dataset?.ul || currentUl;
          const newUlColor = node.dataset?.ulColor || currentUlColor;
          const newMorph = node.dataset?.morph || currentMorph;
          const newMorphId = node.dataset?.morphId || currentMorphId;

          node.childNodes.forEach(child => traverse(child, newColor, newUl, newUlColor, newMorph, newMorphId));

          if (isBlock) {
              if (currentLineChunks.length > 0) {
                  lines.push(currentLineChunks);
                  currentLineChunks = [];
              } else if (node.childNodes.length === 0) {
                  lines.push([]);
              }
          }
      }
  }

  editorEl.childNodes.forEach(child => traverse(child, null, null, null, 'none', null));

  if (currentLineChunks.length > 0) {
      lines.push(currentLineChunks);
  }

  const optimizedLines = lines.map(lineChunks => {
      const merged = [];
      for (const chunk of lineChunks) {
          if (!chunk.text) continue;
          const last = merged[merged.length - 1];
          if (last && last.color === chunk.color && last.ul === chunk.ul && last.ulColor === chunk.ulColor && last.morph === chunk.morph && last.morphId === chunk.morphId) {
              last.text += chunk.text;
          } else {
              merged.push({ ...chunk });
          }
      }
      return merged;
  });

  return optimizedLines.length ? optimizedLines : [[]];
}
