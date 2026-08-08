import React, { memo, useRef } from 'react';
import { useStore } from '../Store';
import { PAPER_DIMS } from '../utils/constants';
import { buildGridGroup } from '../utils/svgGrid';
import { buildTextGroup } from '../utils/svgText';
import ShapesLayer from './ShapesLayer';

const MemoizedGrid = memo(({ W, H, grid, margin }) => {
  return buildGridGroup(W, H, grid, margin);
});

const MemoizedText = memo(({ W, H, grid, mode, mathMode, margin, textLines, printFont, printFontSize }) => {
  return buildTextGroup(W, H, grid, mode, mathMode, margin, textLines, printFont, printFontSize);
});

function PreviewSheet() {
  const { state } = useStore();
  const { format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, textLines, printFont, printFontSize } = state;
  const svgRef = useRef(null);

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
        <MemoizedText W={W} H={H} grid={grid} mode={mode} mathMode={mathMode} margin={currentMargin} textLines={textLines} printFont={printFont} printFontSize={printFontSize} />
      </svg>
    );
  };

  return (
    <main className="preview-wrap">
      <style>{`@page { size: ${isLandscape ? 'landscape' : 'portrait'}; margin: 0; }`}</style>
      <div 
        id="previewSheet"
        className="a4-sheet print-page relative"
        style={{ aspectRatio: `${displayW} / ${H}` }}
        role="img"
        aria-label="Предпросмотр листа прописей"
      >
        {renderSheet(false)}
        {isDouble && renderSheet(true)}

        {/* Global shapes overlay that covers all pages */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          viewBox={`0 0 ${displayW} ${H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <ShapesLayer W={displayW} H={H} svgRef={svgRef} />
        </svg>
      </div>
    </main>
  );
}

export default PreviewSheet;

