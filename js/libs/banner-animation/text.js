import { gsap } from 'gsap';
import { INITIAL_POSITION, INITIAL_OPACITY, FINAL_OPACITY, EASE_TYPE } from '../animation-constants.js';
import { parseOffset, calculateInitialPosition } from './utils.js';

/**
 * Анимация текста с направлением
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {string} offset - Смещение (например, '20px')
 * @param {number} duration - Длительность анимации в секундах
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateText(element, direction, offset, duration) {
  // Парсим смещение
  const { offsetValue, offsetUnit } = parseOffset(offset);

  // Определяем начальные значения в зависимости от направления
  const { initialX, initialY } = calculateInitialPosition(direction, offsetValue);
  const finalX = INITIAL_POSITION;
  const finalY = INITIAL_POSITION;

  // Устанавливаем начальное состояние
  gsap.set(element, {
    opacity: INITIAL_OPACITY,
    x: `${initialX}${offsetUnit}`,
    y: `${initialY}${offsetUnit}`,
  });

  // Запускаем анимацию
  return gsap.to(element, {
    opacity: FINAL_OPACITY,
    x: `${finalX}${offsetUnit}`,
    y: `${finalY}${offsetUnit}`,
    duration,
    ease: EASE_TYPE,
  });
}
