import { gsap } from 'gsap';

const DEFAULT_OFFSET_VALUE = 20;
const DEFAULT_OFFSET_UNIT = 'px';
const INITIAL_POSITION = 0;
const FINAL_POSITION = 0;
const EASE_TYPE = 'power2.out';

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
  const offsetValue = Number.parseFloat(offset) || DEFAULT_OFFSET_VALUE;
  const offsetUnit = offset.replace(/\d/g, '') || DEFAULT_OFFSET_UNIT;

  // Определяем начальные значения в зависимости от направления
  let initialX = INITIAL_POSITION;
  let initialY = INITIAL_POSITION;
  const finalX = FINAL_POSITION;
  const finalY = FINAL_POSITION;

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
