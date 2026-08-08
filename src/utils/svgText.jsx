import React from 'react';
import { GRID_CFG, LATIN_RE, MATH_CHAR_RE, getGridOffsets } from './constants';
import { getMeasuredWidth } from './textMeasurement';

const r = (n) => +n.toFixed(3);

const lineCache = new Map();

function getCachedLine(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX, kPfx, printFont, printFontSize, align) {
  const cfgStr = cfg ? cfg.step : 'none';
  const key = JSON.stringify(lineChunks) + `|${startX}|${endX}|${startY}|${H}|${fontSize}|${lineH}|${fill}|${stepY}|${cfgStr}|${gridType}|${initialX}|${kPfx}|${printFont}|${printFontSize}|${align}`;
  if (lineCache.has(key)) return lineCache.get(key);
  const res = renderLineWithWrap(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX, kPfx, printFont, printFontSize, align);
  if (lineCache.size > 1000) lineCache.clear();
  lineCache.set(key, res);
  return res;
}

export function getTextBounds(margin, W) {
  switch (margin) {
    case 'right': return { startX: 10, endX: W - 20 };
    case 'none': return { startX: 10, endX: W - 2 };
    default: return { startX: 25, endX: W - 2 };
  }
}

function getDecorations(chunk, x, y, decWidth, fontSize, lineH, fill, keyPrefix) {
  const elements = [];
  let k = 0;
  if (chunk.ul && chunk.ul !== 'none') {
    const ulC = '#4a4a4a'; // Фиксированный графитовый цвет для синтаксиса
    const uy = y + 2;
    if (chunk.ul === 'solid') {
      elements.push({ type: 'line', key: `${keyPrefix}_ul${k++}`, x1: r(x), y1: r(uy), x2: r(x + decWidth), y2: r(uy), stroke: ulC, strokeWidth: 0.3 });
    } else if (chunk.ul === 'double') {
      elements.push({ type: 'line', key: `${keyPrefix}_ul${k++}`, x1: r(x), y1: r(uy), x2: r(x + decWidth), y2: r(uy), stroke: ulC, strokeWidth: 0.3 });
      elements.push({ type: 'line', key: `${keyPrefix}_ul${k++}`, x1: r(x), y1: r(uy + 3), x2: r(x + decWidth), y2: r(uy + 3), stroke: ulC, strokeWidth: 0.3 });
    } else if (chunk.ul === 'dashed') {
      elements.push({ type: 'line', key: `${keyPrefix}_ul${k++}`, x1: r(x), y1: r(uy), x2: r(x + decWidth), y2: r(uy), stroke: ulC, strokeWidth: 0.3, strokeDasharray: "4 3" });
    } else if (chunk.ul === 'dotdash') {
      elements.push({ type: 'line', key: `${keyPrefix}_ul${k++}`, x1: r(x), y1: r(uy), x2: r(x + decWidth), y2: r(uy), stroke: ulC, strokeWidth: 0.3, strokeDasharray: "8 3 2 3" });
    } else if (chunk.ul === 'wavy') {
      let d = `M ${r(x)} ${r(uy)}`;
      let up = true;
      for (let cx = x; cx < x + decWidth; cx += 3) {
        const nx = Math.min(cx + 3, x + decWidth);
        const cy = up ? uy - 1.5 : uy + 1.5;
        d += ` Q ${r(cx + 1.5)} ${r(cy)} ${r(nx)} ${r(uy)}`;
        up = !up;
      }
      elements.push({ type: 'path', key: `${keyPrefix}_ul${k++}`, d, stroke: ulC, strokeWidth: 0.3, fill: "none" });
    }
  }

  if (chunk.morph && chunk.morph !== 'none') {
    const mC = '#2e7d32'; // Фиксированный зеленый цвет для морфологии
    const mSw = 0.3;
    const my = y - fontSize * 0.7;

    if (chunk.morph === 'prefix') {
      const d = `M ${r(x)} ${r(my)} L ${r(x + decWidth)} ${r(my)} L ${r(x + decWidth)} ${r(my + 4)}`;
      elements.push({ type: 'path', key: `${keyPrefix}_morph${k++}`, d, stroke: mC, strokeWidth: mSw, fill: "none" });
    } else if (chunk.morph === 'root') {
      const d = `M ${r(x)} ${r(my + 2)} Q ${r(x + decWidth / 2)} ${r(my - 4)} ${r(x + decWidth)} ${r(my + 2)}`;
      elements.push({ type: 'path', key: `${keyPrefix}_morph${k++}`, d, stroke: mC, strokeWidth: mSw, fill: "none" });
    } else if (chunk.morph === 'suffix') {
      const d = `M ${r(x)} ${r(my + 2)} L ${r(x + decWidth / 2)} ${r(my - 4)} L ${r(x + decWidth)} ${r(my + 2)}`;
      elements.push({ type: 'path', key: `${keyPrefix}_morph${k++}`, d, stroke: mC, strokeWidth: mSw, fill: "none" });
      } else if (chunk.morph === 'ending') {
        const boxH = fontSize * 0.8;
        elements.push({ type: 'rect', key: `${keyPrefix}_morph${k++}`, x: r(x), y: r(y - boxH), width: r(decWidth), height: r(boxH + 2), stroke: mC, strokeWidth: mSw, fill: "none" });
      }
    }

    if (chunk.base) {
      const mC = '#2e7d32'; // Фиксированный зеленый цвет для морфологии
      const d = `M ${r(x)} ${r(y)} L ${r(x)} ${r(y + 4)} L ${r(x + decWidth)} ${r(y + 4)} L ${r(x + decWidth)} ${r(y)}`;
      elements.push({ type: 'path', key: `${keyPrefix}_base${k++}`, d, stroke: mC, strokeWidth: 0.3, fill: "none" });
    }
  return elements;
}

function renderLineWithWrap(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX = startX, kPfx, printFont, printFontSize, align) {
  const measureMixedText = (textStr, chunkObj) => {
    let w = 0;
    const chunkFont = chunkObj?.font || printFont;
    const chunkFs = chunkObj?.fs || printFontSize;
    
    const isCursive = chunkFont === 'ClassRoomCursive';
    let font = isCursive ? (LATIN_RE.test(textStr) ? 'ClassRoomCursive' : 'Propisi') : chunkFont;
    let baseFontSize = isCursive ? fontSize : chunkFs;
    
    let digitFs = baseFontSize;
    if (isCursive && cfg) {
      if (cfg.hasHelper) digitFs = fontSize * 0.60;
      else if (cfg.step === 5) digitFs = fontSize * 0.65;
      else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
    }
    let digitFamily = isCursive ? 'ClassRoomCursive' : chunkFont;
    let baseWeight = chunkObj?.bold ? 'bold' : 'normal';
    let digitWeight = chunkObj?.bold ? 'bold' : (isCursive ? 'bold' : 'normal');

    const parts = textStr.split(/(\d+)/g);
    for (const part of parts) {
      if (!part) continue;
      if (/\d+/.test(part)) {
         w += getMeasuredWidth(part, `${digitWeight} ${r(digitFs)}px '${digitFamily}'`);
      } else {
         w += getMeasuredWidth(part.replace(/ /g, '\u00A0'), `${baseWeight} ${r(baseFontSize)}px '${font}'`);
      }
    }
    return w;
  };

  let currentX = initialX;
  let y = startY;
  const elements = [];
  let k = 0;

  for (const chunkObj of lineChunks) {
    if (!chunkObj.text) continue;
    const text = chunkObj.text;
    const chunkColor = chunkObj.color || fill;

    let accText = '';
    let i = 0;

    const flushAcc = (yPos) => {
      if (!accText) return;
      const estWidth = measureMixedText(accText, chunkObj);

      if (yPos <= H) {
        let chunkStr = accText;
        const chunkFont = chunkObj?.font || printFont;
        const chunkFs = chunkObj?.fs || printFontSize;

        const isCursive = chunkFont === 'ClassRoomCursive';
        let font = isCursive ? (LATIN_RE.test(chunkStr) ? 'ClassRoomCursive' : 'Propisi') : chunkFont;
        
        let fontSz = isCursive ? fontSize : chunkFs;
        let digitFs = fontSz;
        if (isCursive && cfg) {
          if (cfg.hasHelper) digitFs = fontSize * 0.60;
          else if (cfg.step === 5) digitFs = fontSize * 0.65;
          else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
        }
        let digitFamily = isCursive ? 'ClassRoomCursive' : chunkFont;
        let baseWeight = chunkObj.bold ? 'bold' : 'normal';
        let digitWeight = chunkObj.bold ? 'bold' : (isCursive ? 'bold' : 'normal');

        const parts = chunkStr.split(/(\d+)/g);
        
        elements.push({
          type: 'text',
          key: `${kPfx}_text${k++}`,
          x: r(currentX),
          y: r(yPos),
          fontSize: r(fontSz),
          fontWeight: baseWeight,
          fill: chunkColor,
          fontFamily: font,
          parts: parts.map(part => {
            if (/\d+/.test(part)) {
              return { isDigit: true, text: part, digitFamily, digitFs: r(digitFs), weight: digitWeight };
            }
            return { isDigit: false, text: part };
          })
        });

        const trimmedText = accText.trimEnd();
        const decWidth = measureMixedText(trimmedText, chunkObj);
        elements.push(...getDecorations(chunkObj, currentX, yPos, decWidth, fontSize, lineH, fill, `${kPfx}_dec${k++}`));
      }
      currentX += estWidth;
      accText = '';
    };

    while (i < text.length) {
      if (text[i] === '´') {
        if (y <= H && accText !== '') {
          const wText = measureMixedText(accText, chunkObj);
          const accX = currentX + wText - (fontSize * 0.15);
          elements.push({
            type: 'text-acc',
            key: `${kPfx}_acc${k++}`,
            x: r(accX),
            y: r(y - fontSize * 0.15),
            fontFamily: "Arial",
            fontSize: r(fontSize * 0.8),
            fill: chunkColor,
            text: '´'
          });
        }
        i++;
        continue;
      }

      const ch = text[i];
      if (accText === '') {
        const chW = measureMixedText(ch, chunkObj);
        if (currentX + chW > endX && currentX > startX) {
          y += stepY;
          currentX = startX;
        }
        accText = ch;
        i++;
        continue;
      }

      const isCurrentLatin = LATIN_RE.test(accText.replace(/\s+/g, ''));
      const isNextLatin = LATIN_RE.test(ch);
      const isChSpace = ch === ' ' || ch === '.' || ch === ',' || ch === '!' || ch === '?';

      if (!isChSpace && isCurrentLatin !== isNextLatin && accText.replace(/\s+/g, '') !== '') {
        flushAcc(y);
        continue; 
      }

      const testStr = accText + ch;
      const estWidth = measureMixedText(testStr, chunkObj);

      if (currentX + estWidth > endX) {
        flushAcc(y);
        y += stepY;
        currentX = startX;
      } else {
        accText += ch;
        i++;
      }
    }
    flushAcc(y);
  }
  return { y, elements };
}

function renderNormalLines(W, H, cfg, margin, gridType, textLines, fill, topOffset, printFont, printFontSize) {
  const { fontSize, lineH, step } = cfg;
  const { startX, endX } = getTextBounds(margin, W);
  let y = topOffset + ((gridType === 'squared' || gridType === 'large_squared') ? step * 2 : 0);
  const allElements = [];
  let k = 0;

  textLines.forEach((lineData, idx) => {
    const rawLine = lineData.chunks || lineData;
    let align = lineData.align || 'left';
    if (!rawLine.length) {
      y += lineH;
      return;
    }

    let initialX = startX;
    
    // Pre-measure entire line for alignment
    if (align === 'center' || align === 'right') {
      let totalW = 0;
      rawLine.forEach(chunkObj => {
        if (!chunkObj.text) return;
        const textStr = chunkObj.text;
        
        const chunkFont = chunkObj?.font || printFont;
        const chunkFs = chunkObj?.fs || printFontSize;
        
        const isCursive = chunkFont === 'ClassRoomCursive';
        let font = isCursive ? (LATIN_RE.test(textStr) ? 'ClassRoomCursive' : 'Propisi') : chunkFont;
        
        let fontSz = isCursive ? fontSize : chunkFs;
        let digitFs = fontSz;
        if (isCursive && cfg) {
          if (cfg.hasHelper) digitFs = fontSize * 0.60;
          else if (cfg.step === 5) digitFs = fontSize * 0.65;
          else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
        }
        let digitFamily = isCursive ? 'ClassRoomCursive' : chunkFont;
        let baseWeight = chunkObj.bold ? 'bold' : 'normal';
        let digitWeight = chunkObj.bold ? 'bold' : (isCursive ? 'bold' : 'normal');

        const parts = textStr.split(/(\d+)/g);
        for (const part of parts) {
          if (!part) continue;
          if (/\d+/.test(part)) {
             totalW += getMeasuredWidth(part, `${digitWeight} ${r(digitFs)}px '${digitFamily}'`);
          } else {
             totalW += getMeasuredWidth(part.replace(/ /g, '\u00A0'), `${baseWeight} ${r(fontSz)}px '${font}'`);
          }
        }
      });
      
      const available = endX - startX;
      if (totalW < available) {
        if (align === 'center') initialX = startX + (available - totalW) / 2;
        if (align === 'right') initialX = endX - totalW;
      }
    }

    const res = renderLineWithWrap(rawLine, startX, endX, y, H, fontSize, lineH, fill, lineH, cfg, gridType, initialX, `nl${idx}_${k++}`, printFont, printFontSize, align);
    allElements.push(...res.elements);
    y = res.y + lineH;
  });
  return allElements;
}

function renderMathLines(W, H, cfg, margin, gridType, textLines, fill, topOffset, printFont, printFontSize) {
  const { step, lineH, fontSize } = cfg;
  
  let redLineX = 0;
  if (margin === 'left') redLineX = 20;
  else if (margin === 'right') redLineX = W - 20;

  let { startX, endX } = getTextBounds(margin, W);
  const offset = (startX - redLineX) / step;
  startX = redLineX + Math.ceil(offset) * step;

  const cols = Math.floor((endX - startX) / step);
  let rowY = topOffset + ((gridType === 'squared' || gridType === 'large_squared') ? step * 2 : step);
  const isCursive = printFont === 'ClassRoomCursive';
  
  const allElements = [];

  textLines.forEach((lineData, lIdx) => {
    if (rowY > H) return;
    const rawLine = lineData.chunks || lineData;
    let align = lineData.align || 'left';
    
    const chars = [];
    for (const chunkObj of rawLine) {
      if (!chunkObj.text) continue;
      let i = 0;
      const t = chunkObj.text;
      while(i < t.length) {
        if (t[i] === '´') {
          chars.push({ ch: '´', chunkObj });
          i++;
        } else {
          chars.push({ ch: t[i], chunkObj });
          i++;
        }
      }
    }
    
    let totalChars = chars.filter(c => c.ch !== '´').length;
    let startCol = 0;
    if (align === 'center' && totalChars < cols) startCol = Math.floor((cols - totalChars) / 2);
    else if (align === 'right' && totalChars < cols) startCol = cols - totalChars;

    let col = startCol;
    let i = 0;

    while (i < chars.length) {
      if (rowY > H) break;
      const { ch, chunkObj } = chars[i];
      const chColor = chunkObj.color || fill;
      
      const chunkFont = chunkObj?.font || printFont;
      const chunkFs = chunkObj?.fs || printFontSize;
      const isCursive = chunkFont === 'ClassRoomCursive';

      const weight = chunkObj.bold ? 'bold' : (isCursive ? 'bold' : 'normal');

      if (ch === '´') {
        if (rowY <= H && col > 0) {
          const prevCx = startX + (col - 1) * step + step / 2;
          allElements.push({
            type: 'text-acc',
            key: `macc${lIdx}_${col}`,
            x: r(prevCx),
            y: r(rowY - fontSize * 0.15),
            fontFamily: "Arial",
            fontSize: r(fontSize * 0.8),
            fill: chColor,
            textAnchor: "middle",
            text: '´'
          });
        }
        i++;
        continue;
      }

      if (ch === ' ') {
        col++;
        if (col >= cols) { rowY += lineH; col = startCol; }
        i++;
      } else if (!isCursive || MATH_CHAR_RE.test(ch)) {
        if (col >= cols) { rowY += lineH; col = startCol; }
        const cx = r(startX + col * step + step / 2);
        
        let digitFs = isCursive ? fontSize : chunkFs;
        if (isCursive && cfg) {
          if (cfg.hasHelper) digitFs = fontSize * 0.60;
          else if (cfg.step === 5) digitFs = fontSize * 0.65;
          else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
        }

        const chStr = ch;
        allElements.push({
          type: 'math-text',
          key: `mtxt${lIdx}_${col}`,
          x: cx,
          y: r(rowY),
          fontFamily: isCursive ? 'ClassRoomCursive' : chunkFont,
          fontSize: r(digitFs),
          fontWeight: weight,
          fill: chColor,
          textAnchor: "middle",
          text: chStr
        });

        const wText = getMeasuredWidth(chStr.replace(/ /g, '\u00A0'), `${weight} ${r(digitFs)}px '${isCursive ? 'ClassRoomCursive' : chunkFont}'`);
        allElements.push(...getDecorations(chunkObj, cx - wText/2, rowY, wText, fontSize, lineH, fill, `mdec${lIdx}_${col}`));

        col++;
        i++;
      } else {
        let j = i;
        while (j < chars.length && chars[j].ch !== ' ' && !MATH_CHAR_RE.test(chars[j].ch)) {
          j++;
        }

        const wordChars = chars.slice(i, j);
        const wordStartX = startX + col * step;
        
        const wordChunks = [];
        let currSub = null;
        for (const wc of wordChars) {
          if (currSub && currSub.chunkObj === wc.chunkObj) {
            currSub.text += wc.ch;
          } else {
            if (currSub) wordChunks.push(currSub);
            currSub = { ...wc.chunkObj, text: wc.ch };
          }
        }
        if (currSub) wordChunks.push(currSub);

        const res = getCachedLine(wordChunks, startX, endX, rowY, H, fontSize, lineH, fill, lineH, cfg, gridType, wordStartX, `mwrd${lIdx}_${col}`, printFont, printFontSize, align);
        allElements.push(...res.elements);
        rowY = res.y;
        col = Math.max(0, Math.round((res.endX - startX) / step));
        
        i = j;
      }
    }
    rowY += lineH;
  });
  return allElements;
}

function renderDataElements(dataElements) {
  return dataElements.map((el) => {
    if (el.type === 'line') {
      return <line key={el.key} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeDasharray={el.strokeDasharray} />;
    } else if (el.type === 'path') {
      return <path key={el.key} d={el.d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} />;
    } else if (el.type === 'rect') {
      return <rect key={el.key} x={el.x} y={el.y} width={el.width} height={el.height} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} />;
    } else if (el.type === 'text') {
      return (
        <text key={el.key} x={el.x} y={el.y} fontSize={el.fontSize} fontWeight={el.fontWeight} dominantBaseline="alphabetic" xmlSpace="preserve" fill={el.fill} fontFamily={el.fontFamily}>
          {el.parts.map((part, pIdx) => {
            if (part.isDigit) {
              return <tspan key={pIdx} fontFamily={part.digitFamily} fontSize={part.digitFs} fontWeight={part.weight}>{part.text}</tspan>;
            }
            return part.text;
          })}
        </text>
      );
    } else if (el.type === 'text-acc') {
      return <text key={el.key} x={el.x} y={el.y} fontFamily={el.fontFamily} fontSize={el.fontSize} fill={el.fill} textAnchor={el.textAnchor}>{el.text}</text>;
    } else if (el.type === 'math-text') {
      return (
        <text key={el.key} x={el.x} y={el.y} fontFamily={el.fontFamily} fontSize={el.fontSize} fontWeight={el.fontWeight} fill={el.fill} textAnchor={el.textAnchor} dominantBaseline="alphabetic">
          {el.text}
        </text>
      );
    }
    return null;
  });
}

export function buildTextGroup(W, H, gridType, mode, mathMode, margin, textLines, printFont = 'PT Sans', printFontSize = 30) {
  const cfg = GRID_CFG[gridType] || GRID_CFG.narrow;
  const fill = mode === 'copy' ? '#1a1a2e' : '#c0cdd8';

  const { topOffset, bottomOffset } = getGridOffsets(gridType);
  const maxH = H - bottomOffset;

  let elements = [];
  if (gridType === 'large_squared' || (gridType === 'squared' && mathMode)) {
    elements = renderMathLines(W, maxH, cfg, margin, gridType, textLines, fill, topOffset, printFont, printFontSize);
  } else {
    elements = renderNormalLines(W, maxH, cfg, margin, gridType, textLines, fill, topOffset, printFont, printFontSize);
  }
  return <g id="svgText" key={`${gridType}-${mode}-${mathMode}`}>{renderDataElements(elements)}</g>;
}
