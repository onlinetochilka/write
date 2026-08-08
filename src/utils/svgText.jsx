import React from 'react';
import { GRID_CFG, LATIN_RE, MATH_CHAR_RE } from './constants';

const r = (n) => +n.toFixed(3);

let measureCtx = null;
const textWidthCache = {};
const lineCache = new Map();

function getCachedLine(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX, kPfx) {
  const cfgStr = cfg ? cfg.step : 'none';
  const key = JSON.stringify(lineChunks) + `|${startX}|${endX}|${startY}|${H}|${fontSize}|${lineH}|${fill}|${stepY}|${cfgStr}|${gridType}|${initialX}|${kPfx}`;
  if (lineCache.has(key)) return lineCache.get(key);
  const res = renderLineWithWrap(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX, kPfx);
  if (lineCache.size > 1000) lineCache.clear();
  lineCache.set(key, res);
  return res;
}

export function getMeasuredWidth(text, fontString) {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  const key = text + '|' + fontString;
  if (textWidthCache[key] !== undefined) return textWidthCache[key];
  measureCtx.font = fontString;
  const width = measureCtx.measureText(text).width;
  textWidthCache[key] = width;
  return width;
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
      elements.push(<line key={`${keyPrefix}_ul${k++}`} x1={r(x)} y1={r(uy)} x2={r(x + decWidth)} y2={r(uy)} stroke={ulC} strokeWidth={0.3} />);
    } else if (chunk.ul === 'double') {
      elements.push(<line key={`${keyPrefix}_ul${k++}`} x1={r(x)} y1={r(uy)} x2={r(x + decWidth)} y2={r(uy)} stroke={ulC} strokeWidth={0.3} />);
      elements.push(<line key={`${keyPrefix}_ul${k++}`} x1={r(x)} y1={r(uy + 3)} x2={r(x + decWidth)} y2={r(uy + 3)} stroke={ulC} strokeWidth={0.3} />);
    } else if (chunk.ul === 'dashed') {
      elements.push(<line key={`${keyPrefix}_ul${k++}`} x1={r(x)} y1={r(uy)} x2={r(x + decWidth)} y2={r(uy)} stroke={ulC} strokeWidth={0.3} strokeDasharray="4 3" />);
    } else if (chunk.ul === 'dotdash') {
      elements.push(<line key={`${keyPrefix}_ul${k++}`} x1={r(x)} y1={r(uy)} x2={r(x + decWidth)} y2={r(uy)} stroke={ulC} strokeWidth={0.3} strokeDasharray="8 3 2 3" />);
    } else if (chunk.ul === 'wavy') {
      let d = `M ${r(x)} ${r(uy)}`;
      let up = true;
      for (let cx = x; cx < x + decWidth; cx += 3) {
        const nx = Math.min(cx + 3, x + decWidth);
        const cy = up ? uy - 1.5 : uy + 1.5;
        d += ` Q ${r(cx + 1.5)} ${r(cy)} ${r(nx)} ${r(uy)}`;
        up = !up;
      }
      elements.push(<path key={`${keyPrefix}_ul${k++}`} d={d} stroke={ulC} strokeWidth={0.3} fill="none" />);
    }
  }

  if (chunk.morph && chunk.morph !== 'none') {
    const mC = '#2e7d32'; // Фиксированный зеленый цвет для морфологии
    const mSw = 0.3;
    const my = y - fontSize * 0.7;

    if (chunk.morph === 'prefix') {
      const d = `M ${r(x)} ${r(my)} L ${r(x + decWidth)} ${r(my)} L ${r(x + decWidth)} ${r(my + 4)}`;
      elements.push(<path key={`${keyPrefix}_morph${k++}`} d={d} stroke={mC} strokeWidth={mSw} fill="none" />);
    } else if (chunk.morph === 'root') {
      const d = `M ${r(x)} ${r(my + 2)} Q ${r(x + decWidth / 2)} ${r(my - 4)} ${r(x + decWidth)} ${r(my + 2)}`;
      elements.push(<path key={`${keyPrefix}_morph${k++}`} d={d} stroke={mC} strokeWidth={mSw} fill="none" />);
    } else if (chunk.morph === 'suffix') {
      const d = `M ${r(x)} ${r(my + 2)} L ${r(x + decWidth / 2)} ${r(my - 4)} L ${r(x + decWidth)} ${r(my + 2)}`;
      elements.push(<path key={`${keyPrefix}_morph${k++}`} d={d} stroke={mC} strokeWidth={mSw} fill="none" />);
    } else if (chunk.morph === 'ending') {
      const boxH = fontSize * 0.8;
      elements.push(<rect key={`${keyPrefix}_morph${k++}`} x={r(x)} y={r(y - boxH)} width={r(decWidth)} height={r(boxH + 2)} stroke={mC} strokeWidth={mSw} fill="none" />);
    } else if (chunk.morph === 'base') {
      const d = `M ${r(x)} ${r(y)} L ${r(x)} ${r(y + 4)} L ${r(x + decWidth)} ${r(y + 4)} L ${r(x + decWidth)} ${r(y)}`;
      elements.push(<path key={`${keyPrefix}_morph${k++}`} d={d} stroke={mC} strokeWidth={0.3} fill="none" />);
    }
  }
  return elements;
}

function renderLineWithWrap(lineChunks, startX, endX, startY, H, fontSize, lineH, fill, stepY, cfg, gridType, initialX = startX, kPfx) {
  const measureMixedText = (textStr) => {
    let w = 0;
    const isPrint = gridType === 'large_squared';
    let font = LATIN_RE.test(textStr) ? 'ClassRoomCursive' : 'Propisi';
    if (isPrint) font = 'RazerF5';
    
    let digitFs = fontSize;
    if (isPrint) digitFs = fontSize;
    else if (cfg) {
      if (cfg.hasHelper) digitFs = fontSize * 0.60;
      else if (cfg.step === 5) digitFs = fontSize * 0.65;
      else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
    }
    let digitFamily = isPrint ? 'RazerF5' : 'ClassRoomCursive';

    const parts = textStr.split(/(\d+)/g);
    for (const part of parts) {
      if (!part) continue;
      if (/\d+/.test(part)) {
         w += getMeasuredWidth(part, `${r(digitFs)}px '${digitFamily}'`);
      } else {
         w += getMeasuredWidth(part.replace(/ /g, '\u00A0'), `${r(fontSize)}px '${font}'`);
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
      const fontName = LATIN_RE.test(accText) ? 'ClassRoomCursive' : 'Propisi';
      const estWidth = measureMixedText(accText);

      if (yPos <= H) {
        const isPrint = gridType === 'large_squared';
        let chunkStr = isPrint ? accText.toUpperCase() : accText;
        let font = LATIN_RE.test(chunkStr) ? 'ClassRoomCursive' : 'Propisi';
        if (isPrint) font = 'RazerF5';
        
        let digitFs = fontSize;
        if (isPrint) digitFs = fontSize;
        else if (cfg) {
          if (cfg.hasHelper) digitFs = fontSize * 0.60;
          else if (cfg.step === 5) digitFs = fontSize * 0.65;
          else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
        }
        let digitFamily = isPrint ? 'RazerF5' : 'ClassRoomCursive';
        let weight = isPrint ? 'normal' : 'bold';

        const parts = chunkStr.split(/(\d+)/g);
        
        elements.push(
          <text key={`${kPfx}_text${k++}`} x={r(currentX)} y={r(yPos)} fontSize={r(fontSize)} dominantBaseline="alphabetic" xmlSpace="preserve" fill={chunkColor} fontFamily={font}>
            {parts.map((part, pIdx) => {
              if (/\d+/.test(part)) {
                return <tspan key={pIdx} fontFamily={digitFamily} fontSize={r(digitFs)} fontWeight={weight}>{part}</tspan>;
              }
              return part;
            })}
          </text>
        );

        const trimmedText = accText.trimEnd();
        const decWidth = measureMixedText(trimmedText);
        elements.push(...getDecorations(chunkObj, currentX, yPos, decWidth, fontSize, lineH, fill, `${kPfx}_dec${k++}`));
      }
      currentX += estWidth;
      accText = '';
    };

    while (i < text.length) {
      if (text[i] === '´') {
        if (y <= H && accText !== '') {
          const wText = measureMixedText(accText);
          const accX = currentX + wText - (fontSize * 0.15);
          elements.push(<text key={`${kPfx}_acc${k++}`} x={r(accX)} y={r(y - fontSize * 0.15)} fontFamily="Arial" fontSize={r(fontSize * 0.8)} fill={chunkColor}>´</text>);
        }
        i++;
        continue;
      }

      const ch = text[i];
      if (accText === '') {
        const chW = measureMixedText(ch);
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
      const estWidth = measureMixedText(testStr);

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
  return { elements, endY: y, endX: currentX };
}

function renderNormalLines(W, H, cfg, margin, gridType, textLines, fill, topOffset) {
  const { fontSize, lineH, step } = cfg;
  const { startX, endX } = getTextBounds(margin, W);
  let y = topOffset + ((gridType === 'squared' || gridType === 'large_squared') ? step * 2 : step);
  const allElements = [];
  let k = 0;

  textLines.forEach((rawLine, idx) => {
    if (y > H) return;
    const lineChunks = Array.isArray(rawLine) ? rawLine : [{ text: rawLine }];
    if (!lineChunks.some(ch => ch.text)) {
      y += lineH;
      return;
    }
    const res = getCachedLine(lineChunks, startX, endX, y, H, fontSize, lineH, fill, lineH, cfg, gridType, startX, `line${idx}`);
    allElements.push(...res.elements);
    y = res.endY + lineH;
  });
  return allElements;
}

function renderMathLines(W, H, cfg, margin, gridType, textLines, fill, topOffset) {
  const { step, lineH, fontSize } = cfg;
  
  let redLineX = 0;
  if (margin === 'left') redLineX = 20;
  else if (margin === 'right') redLineX = W - 20;

  let { startX, endX } = getTextBounds(margin, W);
  const offset = (startX - redLineX) / step;
  startX = redLineX + Math.ceil(offset) * step;

  const cols = Math.floor((endX - startX) / step);
  let rowY = topOffset + ((gridType === 'squared' || gridType === 'large_squared') ? step * 2 : step);
  const isPrint = gridType === 'large_squared';
  
  const allElements = [];

  textLines.forEach((rawLine, lIdx) => {
    if (rowY > H) return;
    const lineChunks = Array.isArray(rawLine) ? rawLine : [{ text: rawLine }];
    const chars = [];
    for (const chunkObj of lineChunks) {
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

    let col = 0;
    let i = 0;

    while (i < chars.length) {
      if (rowY > H) break;
      const { ch, chunkObj } = chars[i];
      const chColor = chunkObj.color || fill;

      if (ch === '´') {
        if (rowY <= H && col > 0) {
          const prevCx = startX + (col - 1) * step + step / 2;
          allElements.push(<text key={`macc${lIdx}_${col}`} x={r(prevCx)} y={r(rowY - fontSize * 0.15)} fontFamily="Arial" fontSize={r(fontSize * 0.8)} fill={chColor} textAnchor="middle">´</text>);
        }
        i++;
        continue;
      }

      if (ch === ' ') {
        col++;
        if (col >= cols) { rowY += lineH; col = 0; }
        i++;
      } else if (isPrint || MATH_CHAR_RE.test(ch)) {
        if (col >= cols) { rowY += lineH; col = 0; }
        const cx = r(startX + col * step + step / 2);
        
        let digitFs = fontSize;
        if (isPrint) digitFs = fontSize * 0.94;
        else if (cfg) {
          if (cfg.hasHelper) digitFs = fontSize * 0.60;
          else if (cfg.step === 5) digitFs = fontSize * 0.65;
          else if (cfg.step === 9.52) digitFs = fontSize * 0.75;
        }

        const chStr = isPrint ? ch.toUpperCase() : ch;
        allElements.push(
          <text key={`mtxt${lIdx}_${col}`} x={cx} y={r(rowY)} fontFamily={isPrint ? 'RazerF5' : 'ClassRoomCursive'} fontSize={r(digitFs)} fontWeight={isPrint ? 'normal' : 'bold'} fill={chColor} textAnchor="middle" dominantBaseline="alphabetic">
            {chStr}
          </text>
        );

        const wText = getMeasuredWidth(chStr.replace(/ /g, '\u00A0'), `${r(digitFs)}px '${isPrint ? 'RazerF5' : 'ClassRoomCursive'}'`);
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

        const res = getCachedLine(wordChunks, startX, endX, rowY, H, fontSize, lineH, fill, lineH, cfg, gridType, wordStartX, `mwrd${lIdx}_${col}`);
        allElements.push(...res.elements);
        rowY = res.endY;
        col = Math.max(0, Math.round((res.endX - startX) / step));
        
        i = j;
      }
    }
    rowY += lineH;
  });
  return allElements;
}

export function buildTextGroup(W, H, gridType, mode, mathMode, margin, textLines) {
  const cfg = GRID_CFG[gridType] || GRID_CFG.narrow;
  const fill = mode === 'copy' ? '#1a1a2e' : '#c0cdd8';

  const topOffset = Math.ceil(25 / cfg.step) * cfg.step;
  const maxH = H - 15;

  let elements = [];
  if (gridType === 'large_squared' || (gridType === 'squared' && mathMode)) {
    elements = renderMathLines(W, maxH, cfg, margin, gridType, textLines, fill, topOffset);
  } else {
    elements = renderNormalLines(W, maxH, cfg, margin, gridType, textLines, fill, topOffset);
  }
  return <g id="svgText">{elements}</g>;
}
