import React from 'react';
import { GRID_CFG, getGridOffsets } from './constants';

const r = (n) => +n.toFixed(3);

export function buildGridGroup(W, H, gridType, margin) {
  let redLineX = 0;
  if (margin === 'left') redLineX = 20;
  else if (margin === 'right') redLineX = W - 20;

  const elements = [];
  let keyIdx = 0;

  const cfg = GRID_CFG[gridType] || GRID_CFG.narrow;
  const { topOffset, bottomOffset } = getGridOffsets(gridType);
  const maxH = H - bottomOffset;

  let lastY = topOffset;
  for (let y = topOffset; y <= maxH + 0.05; y += cfg.step) {
    lastY = y;
  }

  if (gridType === 'squared') {
    const step = cfg.step;
    for (let y = topOffset; y <= maxH + 0.05; y += step) {
      elements.push(<line key={`h${keyIdx++}`} x1={0} y1={r(y)} x2={W} y2={r(y)} stroke="#8A9EBC" strokeWidth={0.15} />);
    }
    for (let x = redLineX; x <= W + 0.05; x += step) {
      elements.push(<line key={`vr${keyIdx++}`} x1={r(x)} y1={0} x2={r(x)} y2={r(H)} stroke="#8A9EBC" strokeWidth={0.15} />);
    }
    for (let x = redLineX; x >= -0.05; x -= step) {
      elements.push(<line key={`vl${keyIdx++}`} x1={r(x)} y1={0} x2={r(x)} y2={r(H)} stroke="#8A9EBC" strokeWidth={0.15} />);
    }
  } else {
    const { step, helper, hasHelper, hasDiag, diagStep } = cfg;
    for (let y = topOffset; y <= maxH + 0.05; y += step) {
      if (hasHelper) {
        const hy = y - helper;
        if (hy >= 5 && hy <= maxH) {
          elements.push(<line key={`h_help${keyIdx++}`} x1={0} y1={r(hy)} x2={W} y2={r(hy)} stroke="#8A9EBC" strokeWidth={0.15} />);
        }
      }
      elements.push(<line key={`h${keyIdx++}`} x1={0} y1={r(y)} x2={W} y2={r(y)} stroke="#8A9EBC" strokeWidth={0.25} />);
    }
    if (hasDiag) {
      const tan65 = 2.1445;
      const totalDx = H / tan65;
      for (let x = -totalDx; x < W + totalDx; x += diagStep) {
        const xAtTop = x + H / tan65;
        const xAtBottom = x;
        elements.push(<line key={`d${keyIdx++}`} x1={r(xAtTop)} y1={0} x2={r(xAtBottom)} y2={r(H)} stroke="#A9B8D0" strokeWidth={0.10} />);
      }
    }
  }

  if (margin === 'left') {
    elements.push(<line key="m_left" x1={20} y1={0} x2={20} y2={H} stroke="#EF4444" strokeWidth={0.30} />);
  } else if (margin === 'right') {
    elements.push(<line key="m_right" x1={r(W - 20)} y1={0} x2={r(W - 20)} y2={H} stroke="#EF4444" strokeWidth={0.30} />);
  }

  return <g id="svgGrid" key={gridType} aria-hidden="true">{elements}</g>;
}
