import {
  OBSERVER_ROOT_MARGIN,
  OBSERVER_THRESHOLD,
  RESIZE_DEBOUNCE_DELAY,
} from './animation-constants.js';

/**
 * Инициализирует функцию после загрузки DOM
 * @param {Function} initFunction - Функция для инициализации
 * @param {number} delay - Задержка в миллисекундах (опционально)
 */
export function initOnDOMReady(initFunction, delay = 0) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (delay > 0) {
        setTimeout(initFunction, delay);
      } else {
        initFunction();
      }
    });
  } else {
    if (delay > 0) {
      setTimeout(initFunction, delay);
    } else {
      initFunction();
    }
  }
}

/**
 * Создает оптимизированный обработчик скролла с использованием requestAnimationFrame
 * @param {Function} handleScroll - Функция обработки скролла
 * @param {object} options - Опции (passive, etc.)
 * @returns {Function} - Функция для удаления обработчика
 */
export function createOptimizedScrollHandler(handleScroll, options = {}) {
  let scrollTimeout = null;

  const scrollHandler = () => {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(handleScroll);
  };

  const scrollOptions = { passive: true, ...options };
  window.addEventListener('scroll', scrollHandler, scrollOptions);

  // Возвращаем функцию для удаления обработчика
  return () => {
    window.removeEventListener('scroll', scrollHandler, scrollOptions);
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
  };
}

/**
 * Создает IntersectionObserver с дефолтными настройками
 * @param {Function} callback - Функция обратного вызова для entries
 * @param {object} options - Дополнительные опции для IntersectionObserver
 * @returns {IntersectionObserver} - Экземпляр IntersectionObserver
 */
export function createIntersectionObserver(callback, options = {}) {
  const observerOptions = {
    root: null,
    rootMargin: options.rootMargin || OBSERVER_ROOT_MARGIN,
    threshold: options.threshold !== undefined ? options.threshold : OBSERVER_THRESHOLD,
    ...options,
  };

  return new IntersectionObserver(callback, observerOptions);
}

/**
 * Создает debounced обработчик resize
 * @param {Function} callback - Функция обратного вызова
 * @param {number} delay - Задержка в миллисекундах
 * @param {object} options - Опции для addEventListener
 * @returns {Function} - Функция для удаления обработчика
 */
export function createDebouncedResizeHandler(callback, delay = RESIZE_DEBOUNCE_DELAY, options = {}) {
  let resizeTimeout = null;

  const resizeHandler = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      callback();
    }, delay);
  };

  const resizeOptions = { passive: true, ...options };
  window.addEventListener('resize', resizeHandler, resizeOptions);

  // Возвращаем функцию для удаления обработчика
  return () => {
    window.removeEventListener('resize', resizeHandler, resizeOptions);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  };
}
