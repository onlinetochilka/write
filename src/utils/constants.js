export const PAPER_DIMS = {
  a4: { w: 210, h: 297 },
  a5: { w: 148, h: 210 },
  notebook: { w: 170, h: 205 },
};

export const GRID_CFG = {
  frequent: { step: 12.70, helper: 4.10, hasHelper: true,  hasDiag: true,  diagStep:  6.35, fontSize: 12.70, lineH: 12.70 },
  slanted:  { step: 12.70, helper: 4.10, hasHelper: true,  hasDiag: true,  diagStep: 26.46, fontSize: 12.70, lineH: 12.70 },
  narrow:   { step: 12.70, helper: 4.10, hasHelper: true,  hasDiag: false, diagStep:  0,    fontSize: 12.70, lineH: 12.70 },
  wide: { step: 8.00, helper: 0, hasHelper: false, hasDiag: false, diagStep: 0, fontSize: 11.50, lineH: 8.00 },
  squared:  { step:  5.00, helper:  0,   hasHelper: false, hasDiag: false, diagStep:  0,    fontSize: 12.50, lineH: 5.00 },
  large_squared: { step: 10.00, helper: 0, hasHelper: false, hasDiag: false, diagStep: 0, fontSize: 12.50, lineH: 10.00 },
};

export function getGridOffsets(gridType) {
  if (gridType === 'squared' || gridType === 'large_squared') {
    return { topOffset: 0, bottomOffset: 0 };
  }
  return { topOffset: 15, bottomOffset: 10 };
}

export const MATH_CHAR_RE = /^[\d+\-=()[\]{}]$/;
export const LATIN_RE = /[a-zA-Z]/;
