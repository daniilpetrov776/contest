import { gsap } from 'gsap';
import {
  FINAL_POSITION,
  EASING_SHOW,
  EASING_HIDE,
  MILLISECONDS_PER_SECOND,
} from '../animation-constants.js';
import { parseOffset, calculateInitialPosition } from '../banner-animation/utils.js';
import { createIntersectionObserver, createOptimizedScrollHandler } from '../animation-utils.js';
import { setInitialPosition } from './utils.js';
import { animateWords, animateWordsReverse } from './animations.js';

/**
 * Создает общую логику для анимации элемента с показом/скрытием
 * @param {HTMLElement} element - Элемент для анимации
 * @param {object} params - Параметры анимации
 * @param {object} options - Дополнительные опции (wordSpans для анимации слов, reverse для title)
 * @returns {object} - Объект с методами управления анимацией
 */
export function createScrollAnimation(element, params, options = {}) {
  const { wordSpans = null, supportsReverse = false } = options;
  const isWordAnimation = wordSpans !== null && wordSpans.length > 0;

  // Отслеживаем состояние анимации
  let lastScrollY = window.scrollY;
  let isAnimating = false;
  let wasVisible = false;
  let animationTimeout = null;

  /**
   * Останавливает текущую анимацию и сбрасывает флаги
   */
  function stopCurrentAnimation() {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
      animationTimeout = null;
    }

    if (isWordAnimation) {
      wordSpans.forEach((wordSpan) => {
        gsap.killTweensOf(wordSpan);
      });
    } else {
      gsap.killTweensOf(element);
    }

    isAnimating = false;
  }

  /**
   * Запускает анимацию появления
   * @param {boolean} reverse - Анимировать в обратном порядке (только для слов)
   */
  function startShowAnimation(reverse = false) {
    stopCurrentAnimation();
    isAnimating = true;

    if (isWordAnimation) {
      // Устанавливаем начальные состояния для всех слов
      setInitialPosition(wordSpans, params.direction, params.offset);

      // Запускаем анимацию
      animateWords(wordSpans, params, reverse);
    } else {
      // Устанавливаем начальное состояние для элемента
      setInitialPosition(element, params.direction, params.offset);

      // Запускаем анимацию
      gsap.to(element, {
        x: FINAL_POSITION,
        y: FINAL_POSITION,
        duration: params.duration,
        ease: EASING_SHOW,
      });
    }

    wasVisible = true;

    // Сбрасываем флаг после завершения анимации
    const animationDuration = isWordAnimation
      ? wordSpans.length * params.staggerDelay + params.duration
      : params.duration;

    animationTimeout = setTimeout(() => {
      isAnimating = false;
      animationTimeout = null;
    }, animationDuration * MILLISECONDS_PER_SECOND);
  }

  /**
   * Запускает анимацию исчезновения
   */
  function startHideAnimation() {
    stopCurrentAnimation();
    isAnimating = true;

    if (isWordAnimation) {
      animateWordsReverse(wordSpans, params);
    } else {
      const { offsetValue, offsetUnit } = parseOffset(params.offset);
      const { initialX, initialY } = calculateInitialPosition(params.direction, offsetValue);

      gsap.to(element, {
        x: `${initialX}${offsetUnit}`,
        y: `${initialY}${offsetUnit}`,
        duration: params.duration,
        ease: EASING_HIDE,
      });
    }

    wasVisible = false;

    // Сбрасываем флаг после завершения анимации
    const animationDuration = isWordAnimation
      ? wordSpans.length * params.staggerDelay + params.duration
      : params.duration;

    animationTimeout = setTimeout(() => {
      isAnimating = false;
      animationTimeout = null;
    }, animationDuration * MILLISECONDS_PER_SECOND);
  }

  // Intersection Observer для отслеживания появления элемента в viewport
  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Используем requestAnimationFrame для отложенного чтения scrollY
      // чтобы избежать forced reflow
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;

        if (entry.isIntersecting) {
          // Элемент появился в viewport
          if (wasVisible && isAnimating) {
            // Если элемент был виден и мы анимируем исчезновение, останавливаем и запускаем появление
            startShowAnimation(supportsReverse ? !scrollingDown : false);
          } else if (!wasVisible || !isAnimating) {
            // Элемент только появился или анимация завершена
            startShowAnimation(supportsReverse ? !scrollingDown : false);
          }
        } else if (!entry.isIntersecting) {
          // Элемент вышел из viewport
          if (wasVisible && isAnimating) {
            // Если элемент был виден и мы анимируем появление, останавливаем и запускаем исчезновение
            startHideAnimation();
          } else if (wasVisible && !isAnimating) {
            // Элемент был виден, но анимация завершена - запускаем исчезновение
            startHideAnimation();
          }
        }

        lastScrollY = currentScrollY;
      });
    });
  });

  // Отслеживаем скролл для определения направления и переключения анимаций
  let lastKnownScrollY = window.scrollY;

  createOptimizedScrollHandler(() => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastKnownScrollY;

    // Если анимация идет и направление скролла изменилось, проверяем состояние
    // Используем requestAnimationFrame для отложенного чтения layout свойств
    if (isAnimating) {
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        // Если элемент виден, но мы анимируем исчезновение, переключаем на появление
        if (isVisible && !wasVisible) {
          startShowAnimation(supportsReverse ? !scrollingDown : false);
        } else if (!isVisible && wasVisible) {
          // Если элемент не виден, но мы анимируем появление, переключаем на исчезновение
          startHideAnimation();
        }
      });
    }

    lastKnownScrollY = currentScrollY;
  });

  // Начинаем наблюдение за элементом
  observer.observe(element);

  return {
    startShowAnimation,
    startHideAnimation,
    stopCurrentAnimation,
  };
}
