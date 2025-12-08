import { gsap } from 'gsap';
import {
  FINAL_POSITION,
  EASING_SHOW,
  EASING_HIDE,
} from '../animation-constants.js';
import { parseOffset, calculateInitialPosition } from '../banner-animation/utils.js';
import { setInitialPosition } from './utils.js';

/**
 * Анимирует слова последовательно
 * @param {HTMLElement[]} wordSpans - Массив span элементов со словами
 * @param {object} params - Параметры анимации
 * @param {boolean} reverse - Анимировать в обратном порядке
 */
export function animateWords(wordSpans, params, reverse = false) {
  const words = reverse ? [...wordSpans].reverse() : wordSpans;

  words.forEach((wordSpan, index) => {
    const delay = index * params.staggerDelay;

    // Устанавливаем начальное состояние
    setInitialPosition(wordSpan, params.direction, params.offset);

    // Запускаем анимацию
    gsap.to(wordSpan, {
      x: FINAL_POSITION,
      y: FINAL_POSITION,
      duration: params.duration,
      delay,
      ease: EASING_SHOW,
    });
  });
}

/**
 * Анимирует слова в обратном порядке (исчезновение)
 * @param {HTMLElement[]} wordSpans - Массив span элементов со словами
 * @param {object} params - Параметры анимации
 */
export function animateWordsReverse(wordSpans, params) {
  const words = [...wordSpans].reverse();

  words.forEach((wordSpan, index) => {
    const delay = index * params.staggerDelay;

    const { offsetValue, offsetUnit } = parseOffset(params.offset);
    const { initialX, initialY } = calculateInitialPosition(params.direction, offsetValue);

    // Анимируем обратно в начальное состояние
    gsap.to(wordSpan, {
      x: `${initialX}${offsetUnit}`,
      y: `${initialY}${offsetUnit}`,
      duration: params.duration,
      delay,
      ease: EASING_HIDE,
    });
  });
}
