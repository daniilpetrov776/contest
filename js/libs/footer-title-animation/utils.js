import { gsap } from 'gsap';
import { parseOffset, calculateInitialPosition } from '../banner-animation/utils.js';
import { BR_TAG_REGEX, WHITESPACE_REGEX, DEFAULT_DURATION, MIN_ANIMATION_PARTS_COUNT } from './constants.js';
import { DEFAULT_STAGGER_DELAY } from '../animation-constants.js';

/**
 * Парсит значение data-scroll-animation атрибута
 * @param {string} animationValue - Значение атрибута data-scroll-animation
 * @returns {object | null} - Объект с параметрами анимации или null
 */
export function parseAnimationParams(animationValue) {
  if (!animationValue) {
    return null;
  }

  const parts = animationValue.split(',').map((part) => part.trim());

  if (parts.length < MIN_ANIMATION_PARTS_COUNT) {
    return null;
  }

  const [direction, offset, duration, staggerDelay] = parts;

  return {
    direction,
    offset,
    duration: Number.parseFloat(duration) || DEFAULT_DURATION,
    staggerDelay: Number.parseFloat(staggerDelay) || DEFAULT_STAGGER_DELAY,
  };
}

/**
 * Разбивает текст на слова и оборачивает каждое слово в span
 * @param {HTMLElement} element - Элемент с текстом
 * @returns {HTMLElement[]} - Массив span элементов со словами
 */
export function wrapWordsInSpans(element) {
  // Сохраняем исходный HTML для сохранения <br> тегов
  const originalHTML = element.innerHTML;

  // Очищаем содержимое элемента
  element.innerHTML = '';

  const wordSpans = [];

  // Разбиваем оригинальный HTML на части, сохраняя <br> теги
  const parts = originalHTML.split(BR_TAG_REGEX);

  parts.forEach((part, partIndex) => {
    if (part.match(BR_TAG_REGEX)) {
      // Это <br> тег - добавляем как есть
      element.appendChild(document.createRange().createContextualFragment(part));
    } else {
      // Это текст - разбиваем на слова
      const partWords = part.trim().split(WHITESPACE_REGEX).filter((word) => word.length > 0);

      partWords.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.maxWidth = '100%';
        span.style.overflowWrap = 'break-word';
        span.style.wordBreak = 'break-word';
        wordSpans.push(span);

        element.appendChild(span);

        // Добавляем пробел после слова, кроме последнего в части
        if (index < partWords.length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
      });

      // Добавляем пробел после текстовой части, если следующая часть не <br>
      if (parts[partIndex + 1] && !parts[partIndex + 1].match(BR_TAG_REGEX)) {
        element.appendChild(document.createTextNode(' '));
      }
    }
  });

  return wordSpans;
}

/**
 * Устанавливает начальное состояние для элементов на основе направления и offset
 * @param {HTMLElement|HTMLElement[]} elements - Элемент или массив элементов
 * @param {string} direction - Направление анимации
 * @param {string} offset - Смещение (например, '20px')
 */
export function setInitialPosition(elements, direction, offset) {
  const { offsetValue, offsetUnit } = parseOffset(offset);
  const { initialX, initialY } = calculateInitialPosition(direction, offsetValue);

  const elementsArray = Array.isArray(elements) ? elements : [elements];

  elementsArray.forEach((element) => {
    gsap.set(element, {
      x: `${initialX}${offsetUnit}`,
      y: `${initialY}${offsetUnit}`,
    });
  });
}
