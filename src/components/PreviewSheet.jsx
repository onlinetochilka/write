import React, { memo } from 'react';
import { useStore } from '../Store';
import { PAPER_DIMS } from '../utils/constants';
import { buildGridGroup } from '../utils/svgGrid';
import { buildTextGroup } from '../utils/svgText';

const MemoizedGrid = memo(({ W, H, grid, margin }) => {
  return buildGridGroup(W, H, grid, margin);
});

const MemoizedText = memo(({ W, H, grid, mode, mathMode, margin, textLines }) => {
  return buildTextGroup(W, H, grid, mode, mathMode, margin, textLines);
});

function PreviewSheet() {
  const { state } = useStore();
  const { format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, textLines } = state;

  const b = PAPER_DIMS[format] || PAPER_DIMS.a4;
  const W = orientation === 'landscape' ? b.h : b.w;
  const H = orientation === 'landscape' ? b.w : b.h;

  const isDouble = layout === '2-pages';
  const displayW = isDouble ? W * 2 : W;
  const isLandscape = (layout === '2-pages') || (orientation === 'landscape');

  const renderSheet = (isClone = false) => {
    let currentMargin = margin;
    if (isClone && mirrorMargins) {
      currentMargin = margin === 'left' ? 'right' : (margin === 'right' ? 'left' : margin);
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: isDouble ? '50%' : '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
        <MemoizedGrid W={W} H={H} grid={grid} margin={currentMargin} />
        <MemoizedText W={W} H={H} grid={grid} mode={mode} mathMode={mathMode} margin={currentMargin} textLines={textLines} />
      </svg>
    );
  };

  return (
    <main className="preview-wrap">
      <style>{`@page { size: ${isLandscape ? 'landscape' : 'portrait'}; margin: 0; }`}</style>
      <div 
        id="previewSheet"
        className="a4-sheet print-page"
        style={{ aspectRatio: `${displayW} / ${H}` }}
        role="img"
        aria-label="Предпросмотр листа прописей"
      >
        {renderSheet(false)}
        {isDouble && renderSheet(true)}
      </div>
    </main>
  );
}

export default PreviewSheet;

