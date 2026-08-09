import React, { memo, useRef, useEffect } from 'react';
import { useStore } from '../Store';
import { PAPER_DIMS } from '../utils/constants';
import { buildGridGroup } from '../utils/svgGrid';
import { buildTextGroup } from '../utils/svgText';
import ShapesLayer from './ShapesLayer';

const MemoizedGrid = memo(({ W, H, grid, margin }) => {
  return buildGridGroup(W, H, grid, margin);
});

const ConnectedTextGroup = memo(({ W, H, grid, mode, mathMode, margin, printFont, printFontSize }) => {
  const { state: textLines } = useStore(s => s.textLines);
  return buildTextGroup(W, H, grid, mode, mathMode, margin, textLines, printFont, printFontSize);
});

function PreviewSheet() {
  const { state, updateState } = useStore(s => ({
    format: s.format,
    orientation: s.orientation,
    grid: s.grid,
    mode: s.mode,
    layout: s.layout,
    mathMode: s.mathMode,
    margin: s.margin,
    mirrorMargins: s.mirrorMargins,
    printFont: s.printFont,
    printFontSize: s.printFontSize,
    shapes: s.shapes
  }));
  const { format, orientation, grid, mode, layout, mathMode, margin, mirrorMargins, printFont, printFontSize, shapes } = state;
  const svgRef = useRef(null);

  useEffect(() => {
    const handlePaste = (e) => {
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      
      const isTableData = text.includes('\t') || text.includes('\n');
      
      // Check if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (isTableData && text.split('\n').length > 1 && text.includes('\t')) {
          e.preventDefault();
          alert('Внимание: Вы пытаетесь вставить целую таблицу внутрь одной ячейки.\n\nДля создания новой таблицы кликните по пустому месту на листе, чтобы снять выделение с текстового поля, и нажмите Ctrl+V еще раз.');
        }
        return;
      }
      
      // If we are here, we are pasting onto the canvas
      if (text.includes('\t')) {
        e.preventDefault();
        
        let rowsData = text.trim().split('\n');
        // Apply limit
        if (rowsData.length > 20) rowsData = rowsData.slice(0, 20);
        
        let maxCols = 0;
        const parsedCells = {};
        
        rowsData.forEach((rowLine, r) => {
          let colsData = rowLine.split('\t');
          if (colsData.length > 10) colsData = colsData.slice(0, 10);
          maxCols = Math.max(maxCols, colsData.length);
          
          colsData.forEach((cellText, c) => {
            if (cellText.trim()) {
              parsedCells[`${r}-${c}`] = cellText.trim();
            }
          });
        });
        
        if (maxCols > 0) {
          const newShape = {
            id: Date.now().toString(),
            type: 'table',
            x: 50, // default position
            y: 50,
            width: maxCols * 25,
            height: rowsData.length * 10,
            rows: rowsData.length,
            cols: maxCols,
            cells: parsedCells,
            strokeColor: '#000000',
            strokeWidth: 0.5,
            fillColor: 'transparent',
            textColor: '#000000',
            fontSize: 12
          };
          
          updateState({ shapes: [...shapes, newShape], selectedShapeId: newShape.id });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [shapes, updateState]);

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
        style={{ 
          width: isDouble ? '50%' : '100%', 
          height: '100%',
          position: 'absolute',
          left: isClone ? '50%' : '0',
          top: 0
        }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
      >
        <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
        <MemoizedGrid W={W} H={H} grid={grid} margin={currentMargin} />
        <ConnectedTextGroup W={W} H={H} grid={grid} mode={mode} mathMode={mathMode} margin={currentMargin} printFont={printFont} printFontSize={printFontSize} />
      </svg>
    );
  };

  return (
    <main className="preview-wrap max-lg:min-h-[85vh]">
      <style>{`@page { size: ${displayW}mm ${H}mm; margin: 0; }`}</style>
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
          style={{ pointerEvents: 'auto', touchAction: 'none' }}
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

