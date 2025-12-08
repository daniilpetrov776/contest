import { gsap } from 'gsap';

const DEFAULT_OFFSET = 20;
const INITIAL_POSITION = 0;
const INITIAL_OPACITY = 0;
const FINAL_OPACITY = 1;
const EASE_TYPE = 'power2.out';

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
  const offsetValue = Number.parseFloat(offset) || DEFAULT_OFFSET;
  const offsetUnit = offset.replace(/\d/g, '') || 'px';

  // Определяем начальные значения в зависимости от направления
  let initialX = INITIAL_POSITION;
  let initialY = INITIAL_POSITION;
  const finalX = INITIAL_POSITION;
  const finalY = INITIAL_POSITION;

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
