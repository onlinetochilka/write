/**
 * featureGates.js — Конфигурация тарифных ограничений.
 *
 * Определяет, какие фичи доступны в Free-тарифе, а какие — только в Pro.
 * Используется AuthProvider / useAuth() для проверки доступа.
 *
 * Утверждённая таблица фич (Implementation Plan v2):
 *
 * FREE:  клетка, широкая линия, узкая линия, чистый лист,
 *        все варианты полей, картинки, отрезки, текстовое поле,
 *        рукописный/печатный шрифт, режим обводки/списывания,
 *        PDF с водяным знаком
 *
 * PRO:   косая линейка (частая + редкая), A5, тетрадный лист,
 *        альбомная ориентация, синтаксический/морфемный разбор,
 *        все геометрические фигуры (кроме отрезка),
 *        координатные инструменты, таблицы N×M,
 *        маркер, мат. режим «1 символ = 1 клетка»,
 *        2 листа рядом, PDF без водяного знака
 */

// ─── Разлиновки ──────────────────────────────────────────
export const FREE_GRIDS = new Set([
  'cell',         // клетка
  'line-narrow',  // узкая линия
  'line-wide',    // широкая линия
  'none',         // чистый лист
]);

export const PRO_GRIDS = new Set([
  'oblique',          // косая частая
  'oblique-rare',     // косая редкая
]);

// ─── Форматы бумаги ──────────────────────────────────────
export const FREE_FORMATS = new Set([
  'a4',
]);

export const PRO_FORMATS = new Set([
  'a5',
  'notebook',     // тетрадный лист
]);

// ─── Ориентация ──────────────────────────────────────────
export const FREE_ORIENTATIONS = new Set([
  'portrait',
]);

export const PRO_ORIENTATIONS = new Set([
  'landscape',
]);

// ─── Layout ──────────────────────────────────────────────
export const PRO_LAYOUTS = new Set([
  '2-pages',
]);

// ─── Инструменты (Toolbar / SmartMenu) ───────────────────
export const PRO_TOOLBAR_FEATURES = new Set([
  'syntax-parse',     // синтаксический разбор
  'morpheme-parse',   // морфемный разбор
  'highlighter',      // маркер
  'math-mode',        // мат. режим «1 символ = 1 клетка»
]);

// ─── Фигуры (InsertOptions) ──────────────────────────────
// Отрезок (line) — Free, всё остальное — Pro
export const FREE_SHAPES = new Set([
  'line',
  'textbox',
]);

export const PRO_SHAPES = new Set([
  'triangle',
  'rectangle',
  'circle',
  'parallelogram',
  'trapezoid',
  'rhombus',
  'coord-ray',
  'coord-line',
  'coord-plane',
  'table',
]);

// ─── Утилиты проверки ────────────────────────────────────

/**
 * Проверяет, доступна ли фича в текущем тарифе.
 * @param {string} featureId — идентификатор фичи
 * @param {string} category — категория ('grid' | 'format' | 'orientation' | 'layout' | 'toolbar' | 'shape')
 * @param {boolean} isPro — имеет ли пользователь Pro-подписку
 * @returns {boolean}
 */
export function isFeatureAvailable(featureId, category, isPro) {
  if (isPro) return true; // Pro-пользователь имеет доступ ко всему

  switch (category) {
    case 'grid':
      return FREE_GRIDS.has(featureId);
    case 'format':
      return FREE_FORMATS.has(featureId);
    case 'orientation':
      return FREE_ORIENTATIONS.has(featureId);
    case 'layout':
      return !PRO_LAYOUTS.has(featureId);
    case 'toolbar':
      return !PRO_TOOLBAR_FEATURES.has(featureId);
    case 'shape':
      return FREE_SHAPES.has(featureId);
    default:
      return true;
  }
}

/**
 * Возвращает label для Pro-бейджа.
 */
export function getProLabel() {
  return 'Pro';
}
