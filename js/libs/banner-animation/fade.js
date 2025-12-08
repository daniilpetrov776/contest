import { gsap } from 'gsap';

const INITIAL_OPACITY = 0;
const FINAL_OPACITY = 1;
const EASE_TYPE = 'power2.out';

/**
 * Анимация fade (появление)
 * @param {HTMLElement} element - Элемент для анимации
 * @param {string} direction - Направление анимации (не используется для fade, но оставлено для совместимости)
 * @param {string} offset - Смещение (не используется для fade, но оставлено для совместимости)
 * @param {number} duration - Длительность анимации в секундах
 * @returns {gsap.core.Tween} - GSAP анимация
 */
export function animateFade(element, direction, offset, duration) {
  gsap.set(element, {
    opacity: INITIAL_OPACITY,
  });

  return gsap.to(element, {
    opacity: FINAL_OPACITY,
    duration,
    ease: EASE_TYPE,
  });
}
