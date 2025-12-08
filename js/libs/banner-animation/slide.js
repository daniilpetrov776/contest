import { gsap } from 'gsap';
import { FINAL_POSITION, EASE_TYPE } from '../animation-constants.js';
import { parseOffset, calculateInitialPosition } from './utils.js';

/**
 * Анимация slide (скольжение)
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (from-down, from-up, from-left, from-right)
 * @param {string} offset - Смещение (например, '20px')
 * @param {number} duration - Длительность анимации в секундах
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateSlide(element, direction, offset, duration) {
  // Парсим смещение
  const { offsetValue, offsetUnit } = parseOffset(offset);

  // Определяем начальные значения в зависимости от направления
  const { initialX, initialY } = calculateInitialPosition(direction, offsetValue);
  const finalX = FINAL_POSITION;
  const finalY = FINAL_POSITION;

  // Устанавливаем начальное состояние
  gsap.set(element, {
    x: `${initialX}${offsetUnit}`,
    y: `${initialY}${offsetUnit}`,
  });

  // Запускаем анимацию
  return gsap.to(element, {
    x: `${finalX}${offsetUnit}`,
    y: `${finalY}${offsetUnit}`,
    duration,
    ease: EASE_TYPE,
  });
}
