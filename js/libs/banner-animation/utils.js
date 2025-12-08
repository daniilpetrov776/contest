import {
  DEFAULT_OFFSET_VALUE,
  DEFAULT_OFFSET_UNIT,
  INITIAL_POSITION,
} from '../animation-constants.js';

/**
 * Парсит значение offset и возвращает значение и единицу измерения
 * @param {string} offset - Смещение (например, '20px')
 * @returns {object} - Объект с offsetValue и offsetUnit
 */
export function parseOffset(offset) {
  const offsetValue = Number.parseFloat(offset) || DEFAULT_OFFSET_VALUE;
  const offsetUnit = offset.replace(/\d/g, '') || DEFAULT_OFFSET_UNIT;

  return { offsetValue, offsetUnit };
}

/**
 * Вычисляет начальную позицию элемента в зависимости от направления
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {number} offsetValue - Значение смещения
 * @returns {object} - Объект с initialX и initialY
 */
export function calculateInitialPosition(direction, offsetValue) {
  let initialX = INITIAL_POSITION;
  let initialY = INITIAL_POSITION;

  switch (direction) {
    case 'from-down':
      initialY = offsetValue;
      break;
    case 'from-up':
      initialY = -offsetValue;
      break;
    case 'from-left':
      initialX = -offsetValue;
      break;
    case 'from-right':
      initialX = offsetValue;
      break;
    default:
      initialY = offsetValue;
  }

  return { initialX, initialY };
}

/**
 * Получает значение transform-origin в зависимости от направления
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @returns {string} - Значение transform-origin
 */
export function getTransformOrigin(direction) {
  switch (direction) {
    case 'from-down':
      return 'bottom';
    case 'from-up':
      return 'top';
    case 'from-left':
      return 'left';
    case 'from-right':
      return 'right';
    default:
      return 'bottom';
  }
}
