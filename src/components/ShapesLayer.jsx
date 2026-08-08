import React, { useCallback, useEffect, useState } from 'react';
import { useStore } from '../Store';

// Helper to convert screen coordinates to SVG coordinates
const getMousePosition = (evt, svg) => {
  const CTM = svg.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
};

const ShapesLayer = ({ W, H, svgRef }) => {
  const { state, updateState } = useStore();
  const { shapes, selectedShapeId } = state;
  const [dragInfo, setDragInfo] = useState(null);
  
  // Handle start dragging a shape
  const handlePointerDown = useCallback((e, id) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    // Select the shape
    updateState({ selectedShapeId: id });
    
    const svg = svgRef.current;
    const pt = getMousePosition(e, svg);
    const shape = shapes.find(s => s.id === id);
    
    setDragInfo({
      id,
      startX: pt.x,
      startY: pt.y,
      initialShapeX: shape.x,
      initialShapeY: shape.y,
      mode: 'drag'
    });
  }, [svgRef, shapes, updateState]);

  const handleResizeDown = useCallback((e, shape) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = getMousePosition(e, svg);
    
    setDragInfo({
      id: shape.id,
      startX: pt.x,
      startY: pt.y,
      initialShapeX: shape.x,
      initialShapeY: shape.y,
      initialWidth: shape.width,
      initialHeight: shape.height || 0,
      mode: 'resize'
    });
  }, [svgRef]);

  const handleRotateDown = useCallback((e, shape) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = getMousePosition(e, svg);
    
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + (shape.height || 0) / 2;
    
    setDragInfo({
      id: shape.id,
      startX: pt.x,
      startY: pt.y,
      cx, cy,
      initialRotation: shape.rotation || 0,
      mode: 'rotate'
    });
  }, [svgRef]);

  // Handle global move
  const handlePointerMove = useCallback((e) => {
    if (!dragInfo || !svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = getMousePosition(e, svg);
    
    const updatedShapes = shapes.map(s => {
      if (s.id === dragInfo.id) {
        if (dragInfo.mode === 'drag') {
          const dx = pt.x - dragInfo.startX;
          const dy = pt.y - dragInfo.startY;
          return {
            ...s,
            x: dragInfo.initialShapeX + dx,
            y: dragInfo.initialShapeY + dy
          };
        } else if (dragInfo.mode === 'resize') {
          const dx = pt.x - dragInfo.startX;
          const dy = pt.y - dragInfo.startY;
          return {
            ...s,
            width: Math.max(10, dragInfo.initialWidth + dx),
            height: Math.max(10, dragInfo.initialHeight + dy)
          };
        } else if (dragInfo.mode === 'rotate') {
          // Calculate angle
          const angle1 = Math.atan2(dragInfo.startY - dragInfo.cy, dragInfo.startX - dragInfo.cx);
          const angle2 = Math.atan2(pt.y - dragInfo.cy, pt.x - dragInfo.cx);
          let deltaAngle = (angle2 - angle1) * (180 / Math.PI);
          return {
            ...s,
            rotation: (dragInfo.initialRotation + deltaAngle)
          };
        }
      }
      return s;
    });
    
    updateState({ shapes: updatedShapes });
  }, [dragInfo, svgRef, shapes, updateState]);

  // Handle global up
  const handlePointerUp = useCallback(() => {
    setDragInfo(null);
  }, []);

  // Global event listeners for smooth dragging outside the shape
  useEffect(() => {
    if (dragInfo) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragInfo, handlePointerMove, handlePointerUp]);

  // Deselect shape when clicking empty area
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const handleSvgClick = (e) => {
      if (e.target === svg || e.target.tagName === 'rect') {
        updateState({ selectedShapeId: null });
      }
    };
    
    svg.addEventListener('pointerdown', handleSvgClick);
    return () => svg.removeEventListener('pointerdown', handleSvgClick);
  }, [svgRef, updateState]);

  // Renders a single shape
  const renderShape = (shape) => {
    const isSelected = selectedShapeId === shape.id;
    const strokeColor = shape.stroke || '#000000';
    const fillColor = shape.fill || 'transparent';
    const strokeWidth = shape.strokeWidth || 1;
    
    let element = null;
    
    if (shape.type === 'line' || shape.type === 'segment' || shape.type === 'ray' || shape.type === 'coord_ray' || shape.type === 'coord_line' || shape.type === 'dashed_segment') {
      // For MVP, we render a basic line. 'width' serves as length.
      element = (
        <g>
          <line 
            x1={0} y1={0} 
            x2={shape.width} y2={0} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            strokeDasharray={shape.type === 'dashed_segment' ? '1.5 1.5' : 'none'}
          />
          {/* Dot at the start for coord_ray, segment, dashed_segment */}
          {(shape.type === 'coord_ray' || shape.type === 'segment' || shape.type === 'dashed_segment') && (
            <circle 
              cx={0} cy={0} 
              r={Math.max(0.6, strokeWidth * 1.5)} 
              fill={strokeColor} 
            />
          )}
          {/* Dot at the end for segment, dashed_segment */}
          {(shape.type === 'segment' || shape.type === 'dashed_segment') && (
            <circle 
              cx={shape.width} cy={0} 
              r={Math.max(0.6, strokeWidth * 1.5)} 
              fill={strokeColor} 
            />
          )}
          {/* Elegant sharp arrow at the right end for ray and coord_line */}
          {(shape.type === 'ray' || shape.type === 'coord_ray' || shape.type === 'coord_line') && (
            <path 
              d={`M${shape.width - 5} -2 L${shape.width} 0 L${shape.width - 5} 2`} 
              fill="none"
              stroke={strokeColor} 
              strokeWidth={Math.max(0.3, strokeWidth)} 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Ticks and Numbers for coordinate rays and lines */}
          {(shape.type === 'coord_ray' || shape.type === 'coord_line') && shape.showTicks !== false && (() => {
            let unitSize = shape.unitSize || 10;
            if (shape.scaleMode === 'fixed_count') {
              const maxU = shape.maxUnits || 5;
              // Leave 10mm buffer at the end before the arrow
              unitSize = (shape.width - 10) / maxU;
            }
            const subdivisions = shape.subdivisions || 1;
            const step = unitSize / subdivisions;
            const ticks = [];
            
            // We want to stop just before the arrow. The arrow takes ~5mm.
            let maxTicks = Math.floor((shape.width - 6) / step);
            if (shape.scaleMode === 'fixed_count') {
              maxTicks = Math.min(maxTicks, (shape.maxUnits || 5) * subdivisions);
            }
            
            for (let i = 0; i <= maxTicks; i++) {
              const x = i * step;
              const isMainTick = i % subdivisions === 0;
              const tickValue = (shape.startValue || 0) + (i / subdivisions);
              
              ticks.push(
                <line 
                  key={`tick-${i}`}
                  x1={x} y1={isMainTick ? -2 : -1} 
                  x2={x} y2={isMainTick ? 2 : 1} 
                  stroke={strokeColor} 
                  strokeWidth={strokeWidth} 
                />
              );
              
              if (isMainTick && shape.showNumbers !== false) {
                ticks.push(
                  <text 
                    key={`num-${i}`}
                    x={x} y={8} 
                    fontSize="5" 
                    fill={strokeColor}
                    fontFamily="Georgia, serif"
                    textAnchor="middle"
                  >
                    {tickValue}
                  </text>
                );
              }
            }
            return <g>{ticks}</g>;
          })()}
        </g>
      );
    } else if (shape.type === 'triangle') {
      const points = shape.triangleType === 'right' 
        ? `0,${shape.height} 0,0 ${shape.width},${shape.height}`
        : `0,${shape.height} ${shape.width / 2},0 ${shape.width},${shape.height}`;
        
      let A, B, C;
      if (shape.triangleType === 'right') {
        A = { x: 0, y: shape.height };
        B = { x: 0, y: 0 };
        C = { x: shape.width, y: shape.height };
      } else {
        A = { x: 0, y: shape.height };
        B = { x: shape.width / 2, y: 0 };
        C = { x: shape.width, y: shape.height };
      }
      
      const dist = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
      const add = (p1, p2) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
      const sub = (p1, p2) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
      const scale = (p, s) => ({ x: p.x * s, y: p.y * s });
      const dot = (p1, p2) => p1.x * p2.x + p1.y * p2.y;
      
      const a = dist(B, C);
      const b = dist(A, C);
      const c = dist(A, B);
      
      const S = (shape.width * shape.height) / 2;
      const extraColor = shape.extraColor || '#3b82f6';
      const extraStrokeWidth = 0.5;
      
      const extraElements = [];
      
      if (shape.incircle) {
        const p = (a + b + c) / 2;
        const r = S / p;
        const Ix = (a * A.x + b * B.x + c * C.x) / (a + b + c);
        const Iy = (a * A.y + b * B.y + c * C.y) / (a + b + c);
        extraElements.push(<circle key="incircle" cx={Ix} cy={Iy} r={r} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
      }
      
      if (shape.circumcircle || (shape.perpBisectors && shape.perpBisectors.length > 0)) {
        const D = 2 * (A.x*(B.y - C.y) + B.x*(C.y - A.y) + C.x*(A.y - B.y));
        const Ux = ((A.x**2 + A.y**2)*(B.y - C.y) + (B.x**2 + B.y**2)*(C.y - A.y) + (C.x**2 + C.y**2)*(A.y - B.y)) / D;
        const Uy = ((A.x**2 + A.y**2)*(C.x - B.x) + (B.x**2 + B.y**2)*(A.x - C.x) + (C.x**2 + C.y**2)*(B.x - A.x)) / D;
        const R = (a * b * c) / (4 * S);
        const U = { x: Ux, y: Uy };
        
        if (shape.circumcircle) {
          extraElements.push(<circle key="circumcircle" cx={Ux} cy={Uy} r={R} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
        }
        
        if (shape.perpBisectors && shape.perpBisectors.length > 0) {
          const drawPerp = (P1, P2, id) => {
            const M = scale(add(P1, P2), 0.5);
            let dir;
            if (dist(M, U) < 0.1) {
               const v = sub(P2, P1);
               dir = { x: -v.y, y: v.x };
               const len = Math.sqrt(dir.x**2 + dir.y**2);
               dir = scale(dir, 1/len);
            } else {
               const v = sub(U, M);
               const len = Math.sqrt(v.x**2 + v.y**2);
               dir = scale(v, 1/len);
            }
            const pStart = sub(M, scale(dir, 20));
            const pEnd = add(M, scale(dir, 20));
            extraElements.push(<line key={`perp-${id}`} x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="2,2" />);
            
            if (shape.showRightAngles !== false) {
              const vLine = dir;
              const vSide = sub(P2, P1);
              const lSide = Math.sqrt(vSide.x**2 + vSide.y**2);
              const uSide = scale(vSide, 1/lSide);
              const pCorner = add(add(M, scale(vLine, 4)), scale(uSide, 4));
              extraElements.push(
                <polyline key={`perp-ra-${id}`} points={`${M.x + vLine.x*4},${M.y + vLine.y*4} ${pCorner.x},${pCorner.y} ${M.x + uSide.x*4},${M.y + uSide.y*4}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />
              );
            }
          };
          if (shape.perpBisectors.includes('a')) drawPerp(B, C, 'a');
          if (shape.perpBisectors.includes('b')) drawPerp(A, C, 'b');
          if (shape.perpBisectors.includes('c')) drawPerp(A, B, 'c');
        }
      }
      
      const drawAltitude = (fromP, lineP1, lineP2, id) => {
        const V = sub(lineP2, lineP1);
        const t = dot(sub(fromP, lineP1), V) / dot(V, V);
        const F = add(lineP1, scale(V, t));
        extraElements.push(<line key={`alt-${id}`} x1={fromP.x} y1={fromP.y} x2={F.x} y2={F.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
        
        if (shape.showRightAngles !== false) {
           const v1 = sub(fromP, F);
           const l1 = Math.sqrt(v1.x**2 + v1.y**2);
           if (l1 > 0) {
             const u1 = scale(v1, 4/l1);
             const mid = scale(add(lineP1, lineP2), 0.5);
             let v2 = sub(mid, F);
             let l2 = Math.sqrt(v2.x**2 + v2.y**2);
             if (l2 < 0.1) { v2 = V; l2 = Math.sqrt(v2.x**2 + v2.y**2); }
             const u2 = scale(v2, 4/l2);
             const corner = add(add(F, u1), u2);
             extraElements.push(<polyline key={`alt-ra-${id}`} points={`${F.x + u1.x},${F.y + u1.y} ${corner.x},${corner.y} ${F.x + u2.x},${F.y + u2.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
           }
        }
      };
      
      if (shape.altitudes && shape.altitudes.includes('A')) drawAltitude(A, B, C, 'A');
      if (shape.altitudes && shape.altitudes.includes('B')) drawAltitude(B, A, C, 'B');
      if (shape.altitudes && shape.altitudes.includes('C')) drawAltitude(C, A, B, 'C');
      
      const drawMedian = (fromP, lineP1, lineP2, id) => {
        const M = scale(add(lineP1, lineP2), 0.5);
        extraElements.push(<line key={`med-${id}`} x1={fromP.x} y1={fromP.y} x2={M.x} y2={M.y} stroke={extraColor} strokeWidth={extraStrokeWidth} />);
        
        if (shape.showEqualityStrokes !== false) {
          const drawStrokes = (midP, dirV, count, strokeId) => {
             const n = { x: -dirV.y, y: dirV.x };
             const len = Math.sqrt(n.x**2 + n.y**2);
             const un = scale(n, 2/len);
             const uv = scale(dirV, 1.5/len);
             for(let i=0; i<count; i++) {
                const offset = scale(uv, i - (count-1)/2);
                const p = add(midP, offset);
                extraElements.push(<line key={strokeId+'-'+i} x1={p.x - un.x} y1={p.y - un.y} x2={p.x + un.x} y2={p.y + un.y} stroke={extraColor} strokeWidth={extraStrokeWidth} />);
             }
          };
          const Q1 = scale(add(lineP1, M), 0.5);
          const Q2 = scale(add(M, lineP2), 0.5);
          const V = sub(lineP2, lineP1);
          let count = id === 'A' ? 1 : id === 'B' ? 2 : 3;
          drawStrokes(Q1, V, count, `stroke-${id}-1`);
          drawStrokes(Q2, V, count, `stroke-${id}-2`);
        }
      };
      
      if (shape.medians && shape.medians.includes('A')) drawMedian(A, B, C, 'A');
      if (shape.medians && shape.medians.includes('B')) drawMedian(B, A, C, 'B');
      if (shape.medians && shape.medians.includes('C')) drawMedian(C, A, B, 'C');
      
      const drawBisector = (fromP, lineP1, lineP2, id) => {
        const l1 = dist(fromP, lineP1);
        const l2 = dist(fromP, lineP2);
        const Fx = (l2 * lineP1.x + l1 * lineP2.x) / (l1 + l2);
        const Fy = (l2 * lineP1.y + l1 * lineP2.y) / (l1 + l2);
        extraElements.push(<line key={`bis-${id}`} x1={fromP.x} y1={fromP.y} x2={Fx} y2={Fy} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="4,2" />);
      };
      
      if (shape.bisectors && shape.bisectors.includes('A')) drawBisector(A, B, C, 'A');
      if (shape.bisectors && shape.bisectors.includes('B')) drawBisector(B, A, C, 'B');
      if (shape.bisectors && shape.bisectors.includes('C')) drawBisector(C, A, B, 'C');

      const drawMidline = (lineP1, lineP2, oppP, id) => {
        const m1 = scale(add(oppP, lineP1), 0.5);
        const m2 = scale(add(oppP, lineP2), 0.5);
        extraElements.push(<line key={`midline-${id}`} x1={m1.x} y1={m1.y} x2={m2.x} y2={m2.y} stroke={extraColor} strokeWidth={extraStrokeWidth} />);
      };
      
      if (shape.midlines && shape.midlines.includes('a')) drawMidline(B, C, A, 'a');
      if (shape.midlines && shape.midlines.includes('b')) drawMidline(A, C, B, 'b');
      if (shape.midlines && shape.midlines.includes('c')) drawMidline(A, B, C, 'c');

      element = (
        <g>
          <polygon 
            points={points}
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
          {extraElements}
        </g>
      );
    } else if (shape.type === 'parallelogram') {
      const extraElements = [];
      const extraColor = shape.extraColor || '#3b82f6';
      const extraStrokeWidth = 0.5;
      
      const angle = shape.angle || 60;
      let shift = shape.height / Math.tan(angle * Math.PI / 180);
      if (shape.parallelogramType === 'rhombus') {
         shift = shape.width * Math.cos(angle * Math.PI / 180);
      }
      
      const A = { x: 0, y: shape.height };
      const B = { x: shift, y: 0 };
      const C = { x: shift + shape.width, y: 0 };
      const D = { x: shape.width, y: shape.height };
      const points = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;

      if (shape.diagonals && shape.diagonals.includes('1')) {
        extraElements.push(<line key="d1" x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }
      if (shape.diagonals && shape.diagonals.includes('2')) {
        extraElements.push(<line key="d2" x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }

      if (shape.diagonals && shape.diagonals.length === 2 && shape.parallelogramType === 'rhombus' && shape.showRightAngles !== false) {
        const M = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
        const u1 = { x: A.x - M.x, y: A.y - M.y }; const l1 = Math.sqrt(u1.x**2 + u1.y**2);
        const u2 = { x: D.x - M.x, y: D.y - M.y }; const l2 = Math.sqrt(u2.x**2 + u2.y**2);
        const dir1 = { x: u1.x / l1, y: u1.y / l1 };
        const dir2 = { x: u2.x / l2, y: u2.y / l2 };
        const p1 = { x: M.x + dir1.x * 4, y: M.y + dir1.y * 4 };
        const p2 = { x: M.x + dir2.x * 4, y: M.y + dir2.y * 4 };
        const p3 = { x: p1.x + dir2.x * 4, y: p1.y + dir2.y * 4 };
        extraElements.push(<polyline key="rh-ra" points={`${p1.x},${p1.y} ${p3.x},${p3.y} ${p2.x},${p2.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
      }

      const drawAlt = (P, id) => {
         const targetY = P.y === 0 ? shape.height : 0;
         extraElements.push(<line key={`alt-${id}`} x1={P.x} y1={P.y} x2={P.x} y2={targetY} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
         if (shape.showRightAngles !== false) {
             const dirY = targetY > P.y ? 1 : -1;
             const dirX = 1; 
             const p1 = { x: P.x, y: targetY - dirY * 4 };
             const p2 = { x: P.x + dirX * 4, y: targetY - dirY * 4 };
             const p3 = { x: P.x + dirX * 4, y: targetY };
             extraElements.push(<polyline key={`alt-ra-${id}`} points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
         }
      };

      if (shape.altitudes) {
        if (shape.altitudes.includes('A')) drawAlt(A, 'A');
        if (shape.altitudes.includes('B')) drawAlt(B, 'B');
        if (shape.altitudes.includes('C')) drawAlt(C, 'C');
        if (shape.altitudes.includes('D')) drawAlt(D, 'D');
      }

      const drawBisector = (P, prevP, nextP, id) => {
        const dist = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
        const lPrev = dist(P, prevP);
        const lNext = dist(P, nextP);
        const vPrev = { x: (prevP.x - P.x) / lPrev, y: (prevP.y - P.y) / lPrev };
        const vNext = { x: (nextP.x - P.x) / lNext, y: (nextP.y - P.y) / lNext };
        const bisectorDir = { x: vPrev.x + vNext.x, y: vPrev.y + vNext.y };
        const bLen = Math.sqrt(bisectorDir.x**2 + bisectorDir.y**2);
        const dir = { x: bisectorDir.x / bLen, y: bisectorDir.y / bLen };
        
        // Ray cast to find intersection with other sides
        // We just draw it a bit long and let it clip, or we calculate exact.
        // Actually, let's just draw it with length equal to width.
        const length = shape.width;
        extraElements.push(<line key={`bis-${id}`} x1={P.x} y1={P.y} x2={P.x + dir.x * length} y2={P.y + dir.y * length} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="4,2" />);
      };

      if (shape.bisectors) {
        if (shape.bisectors.includes('A')) drawBisector(A, D, B, 'A');
        if (shape.bisectors.includes('B')) drawBisector(B, A, C, 'B');
        if (shape.bisectors.includes('C')) drawBisector(C, B, D, 'C');
        if (shape.bisectors.includes('D')) drawBisector(D, C, A, 'D');
      }

      element = (
        <g>
          <polygon 
            points={points}
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
          <g clipPath={`url(#clip-shape-${shape.id})`}>
            {extraElements}
          </g>
          <clipPath id={`clip-shape-${shape.id}`}>
            <polygon points={points} />
          </clipPath>
        </g>
      );
    } else if (shape.type === 'trapezoid') {
      const extraElements = [];
      const extraColor = shape.extraColor || '#3b82f6';
      const extraStrokeWidth = 0.5;
      
      const topWidth = shape.topWidth || 60;
      let a1 = shape.angle1 || 60;
      let a2 = shape.angle2 || 70;
      
      if (shape.trapezoidType === 'right') {
        a1 = 90;
      } else if (shape.trapezoidType === 'isosceles') {
        a2 = a1;
      }
      
      const h = shape.height || 50;
      
      // Calculate shifts based on angles
      // If angle is 90, shift is 0.
      const shift1 = a1 === 90 ? 0 : h / Math.tan(a1 * Math.PI / 180);
      const shift2 = a2 === 90 ? 0 : h / Math.tan(a2 * Math.PI / 180);
      
      // Coordinate system:
      // A: (0, h), B: (shift1, 0), C: (shift1 + topWidth, 0), D: (shift1 + topWidth + shift2, h)
      // To prevent negative coordinates (if angle > 90), we should offset everything if shift1 < 0
      
      const minX = Math.min(0, shift1);
      const offsetX = -minX;
      
      const A = { x: offsetX, y: h };
      const B = { x: offsetX + shift1, y: 0 };
      const C = { x: offsetX + shift1 + topWidth, y: 0 };
      const D = { x: offsetX + shift1 + topWidth + shift2, y: h };
      
      // Update actual rendering width/height for bounding box conceptually, but SVG handles it.
      const points = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;

      if (shape.diagonals && shape.diagonals.includes('1')) {
        extraElements.push(<line key="d1" x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }
      if (shape.diagonals && shape.diagonals.includes('2')) {
        extraElements.push(<line key="d2" x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }
      
      if (shape.showMidline) {
        const M1 = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        const M2 = { x: (C.x + D.x) / 2, y: (C.y + D.y) / 2 };
        extraElements.push(<line key="midline" x1={M1.x} y1={M1.y} x2={M2.x} y2={M2.y} stroke={extraColor} strokeWidth={extraStrokeWidth} />);
      }
      
      if (shape.altitudes) {
        if (shape.altitudes.includes('B')) {
           extraElements.push(<line key="alt-B" x1={B.x} y1={B.y} x2={B.x} y2={A.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
           if (shape.showRightAngles !== false && B.x > A.x && B.x < D.x) {
               const p1 = { x: B.x, y: A.y - 4 };
               const p2 = { x: B.x + 4, y: A.y - 4 };
               const p3 = { x: B.x + 4, y: A.y };
               extraElements.push(<polyline key="alt-ra-B" points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
           }
        }
        if (shape.altitudes.includes('C')) {
           extraElements.push(<line key="alt-C" x1={C.x} y1={C.y} x2={C.x} y2={D.y} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
           if (shape.showRightAngles !== false && C.x > A.x && C.x < D.x) {
               const p1 = { x: C.x, y: D.y - 4 };
               const p2 = { x: C.x - 4, y: D.y - 4 };
               const p3 = { x: C.x - 4, y: D.y };
               extraElements.push(<polyline key="alt-ra-C" points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
           }
        }
      }

      element = (
        <g>
          <polygon 
            points={points}
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
          {extraElements}
        </g>
      );
    } else if (shape.type === 'rectangle') {
      const extraElements = [];
      const extraColor = shape.extraColor || '#3b82f6';
      const extraStrokeWidth = 0.5;
      
      if (shape.diagonals && shape.diagonals.includes('1')) {
        extraElements.push(<line key="d1" x1="0" y1={shape.height} x2={shape.width} y2="0" stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }
      if (shape.diagonals && shape.diagonals.includes('2')) {
        extraElements.push(<line key="d2" x1="0" y1="0" x2={shape.width} y2={shape.height} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }

      element = (
        <g>
          <rect 
            width={shape.width} 
            height={shape.height} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
          {extraElements}
        </g>
      );
    } else if (shape.type === 'circle') {
      const cx = shape.width / 2;
      const cy = shape.height / 2;
      const r = Math.min(shape.width, shape.height) / 2;
      
      const extraElements = [];
      const extraColor = shape.extraColor || '#3b82f6';
      const extraStrokeWidth = 0.5;
      
      const angle = -Math.PI / 4;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      
      if (shape.showRadius) {
        extraElements.push(<line key="rad" x1={cx} y1={cy} x2={px} y2={py} stroke={extraColor} strokeWidth={extraStrokeWidth} strokeDasharray="3,1" />);
      }
      if (shape.showTangent) {
        const tx = Math.cos(angle + Math.PI/2) * r;
        const ty = Math.sin(angle + Math.PI/2) * r;
        extraElements.push(<line key="tan" x1={px - tx} y1={py - ty} x2={px + tx} y2={py + ty} stroke={extraColor} strokeWidth={extraStrokeWidth} />);
        
        if (shape.showRadius && shape.showRightAngles !== false) {
          const uRad = { x: -Math.cos(angle), y: -Math.sin(angle) };
          const uTan = { x: Math.cos(angle + Math.PI/2), y: Math.sin(angle + Math.PI/2) };
          const c1 = { x: px + uRad.x * 4, y: py + uRad.y * 4 };
          const c2 = { x: c1.x + uTan.x * 4, y: c1.y + uTan.y * 4 };
          const c3 = { x: px + uTan.x * 4, y: py + uTan.y * 4 };
          extraElements.push(<polyline key="tan-ra" points={`${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}`} fill="none" stroke={extraColor} strokeWidth={extraStrokeWidth} />);
        }
      }

      element = (
        <g>
          <circle 
            cx={cx} cy={cy} r={r} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
          {extraElements}
          <circle 
            cx={cx} cy={cy} r={1} 
            fill={strokeColor} 
          />
        </g>
      );
    } else if (shape.type === 'ellipse') {
      element = (
        <g>
          <ellipse 
            cx={shape.width / 2} cy={shape.height / 2} 
            rx={shape.width / 2} ry={shape.height / 2} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={fillColor} 
          />
        </g>
      );
    }
    
    // Parse labels
    let labels = [];
    if (shape.labels) {
      if (shape.labels.includes(',')) {
        labels = shape.labels.split(',').map(s => s.trim()).filter(s => s);
      } else if (shape.labels.includes(' ')) {
        labels = shape.labels.split(/\s+/).filter(s => s);
      } else {
        labels = shape.labels.split('');
      }
    }
    
    let labelElements = null;
    
    if (labels.length > 0) {
      const vertices = [];
      if (shape.type === 'coord_ray' || shape.type === 'coord_line') {
        vertices.push({ x: shape.width + 2, y: -2, align: 'start' }); // Right end only
      } else if (shape.type === 'line' || shape.type === 'segment' || shape.type === 'ray' || shape.type === 'dashed_segment') {
        vertices.push({ x: -2, y: -2, align: 'end' }); // Left
        vertices.push({ x: shape.width + 2, y: -2, align: 'start' }); // Right
      } else if (shape.type === 'triangle') {
        if (shape.triangleType === 'right') {
          vertices.push({ x: -2, y: shape.height + 8, align: 'end' }); // Bottom left
          vertices.push({ x: -2, y: -2, align: 'end' }); // Top left
          vertices.push({ x: shape.width + 2, y: shape.height + 8, align: 'start' }); // Bottom right
        } else {
          vertices.push({ x: -2, y: shape.height + 8, align: 'end' }); // Bottom left
          vertices.push({ x: shape.width/2, y: -2, align: 'middle' }); // Top center
          vertices.push({ x: shape.width + 2, y: shape.height + 8, align: 'start' }); // Bottom right
        }
      } else if (shape.type === 'rectangle') {
        vertices.push({ x: -2, y: -2, align: 'end' }); // Top left
        vertices.push({ x: shape.width + 2, y: -2, align: 'start' }); // Top right
        vertices.push({ x: shape.width + 2, y: shape.height + 8, align: 'start' }); // Bottom right
        vertices.push({ x: -2, y: shape.height + 8, align: 'end' }); // Bottom left
      }
      
      labelElements = labels.map((l, idx) => {
        if (idx >= vertices.length) return null;
        const v = vertices[idx];
        return (
          <text 
            key={idx}
            x={v.x} 
            y={v.y} 
            fontSize="7" 
            fontFamily="Georgia, serif" 
            fontStyle="italic"
            textAnchor={v.align}
            fill="#000000"
          >
            {l}
          </text>
        );
      });
    }
    
    return (
      <g 
        key={shape.id} 
        transform={`translate(${shape.x}, ${shape.y}) rotate(${shape.rotation || 0})`}
        onPointerDown={(e) => handlePointerDown(e, shape.id)}
        style={{ cursor: isSelected ? 'move' : 'pointer' }}
      >
        {/* Invisible larger bounding box to make clicking easier for thin lines */}
        <rect 
          x={-10} y={-10} 
          width={shape.width + 20} height={(shape.height || 0) + 20} 
          fill="transparent" 
          stroke="none" 
        />
        {element}
        {labelElements}
        
        {/* Bounding box / Selection Outline */}
        {isSelected && (
          <g className="no-print">
            <rect 
              x={-4} y={-4} 
              width={shape.width + 8} height={(shape.height || 0) + 8} 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="1.5" 
              strokeDasharray="4 4"
            />
            {/* Resize handle (bottom right) */}
            <circle 
              cx={shape.width + 4} cy={(shape.height || 0) + 4} 
              r="4" 
              fill="#ffffff" 
              stroke="#0ea5e9" 
              strokeWidth="1.5"
              style={{ cursor: 'nwse-resize' }}
              onPointerDown={(e) => handleResizeDown(e, shape)}
            />
            {/* Rotation handle (top center) */}
            <line 
              x1={shape.width / 2} y1={-4} 
              x2={shape.width / 2} y2={-20} 
              stroke="#0ea5e9" 
              strokeWidth="1"
            />
            <circle 
              cx={shape.width / 2} cy={-20} 
              r="4" 
              fill="#ffffff" 
              stroke="#10b981" 
              strokeWidth="1.5"
              style={{ cursor: 'crosshair' }}
              onPointerDown={(e) => handleRotateDown(e, shape)}
            />
          </g>
        )}
      </g>
    );
  };

  return (
    <g className="shapes-layer">
      {shapes.map(renderShape)}
    </g>
  );
};

export default ShapesLayer;
