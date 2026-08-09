let measureCtx = null;
let textWidthCache = {};

export function clearTextMeasurementCache() {
  textWidthCache = {};
}

if (typeof document !== 'undefined' && document.fonts) {
  document.fonts.ready.then(() => {
    clearTextMeasurementCache();
  });
  if (document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', clearTextMeasurementCache);
  }
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
