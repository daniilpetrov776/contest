import {
  DESKTOP_MIN_WIDTH,
  TABLET_MIN_WIDTH,
  DESKTOP_WIDTH_PX,
  DESKTOP_HEIGHT_PX,
  TABLET_WIDTH_PX,
  TABLET_HEIGHT_PX,
  MOBILE_WIDTH_PX,
  MOBILE_HEIGHT_PX,
  PERCENT_MULTIPLIER,
  MAX_WIDTH,
  MAX_HEIGHT,
  SCROLL_PROGRESS_MULTIPLIER,
  SCROLL_PROGRESS_MAX,
  EXPANDABLE_MIN_WIDTH,
} from './constants.js';

/**
 * Получает правильную ширину viewport
 * В адаптивном режиме браузера window.innerWidth может возвращать реальную ширину окна
 * @returns {number}
 */
const getViewportWidth = () => {
  // Используем visualViewport если доступен (более точный для эмуляторов)
  if (window.visualViewport && window.visualViewport.width) {
    return window.visualViewport.width;
  }
  // Иначе используем clientWidth, который более точно отражает размер viewport
  return document.documentElement.clientWidth || window.innerWidth;
};

/**
 * Проверяет, должно ли видео расширяться при скролле
 * @returns {boolean}
 */
export function checkIsDesktop() {
  return getViewportWidth() >= EXPANDABLE_MIN_WIDTH;
}

/**
 * Получает минимальные размеры в зависимости от размера экрана
 * @returns {object} - Объект с width и height в процентах
 */
export function getMinSizes() {
  const windowWidth = getViewportWidth();
  const windowHeight = window.innerHeight;

  if (windowWidth >= DESKTOP_MIN_WIDTH) {
    return {
      width: (DESKTOP_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
      height: (DESKTOP_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
    };
  } else if (windowWidth >= TABLET_MIN_WIDTH) {
    return {
      width: (TABLET_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
      height: (TABLET_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
    };
  } else {
    return {
      width: (MOBILE_WIDTH_PX / windowWidth) * PERCENT_MULTIPLIER,
      height: (MOBILE_HEIGHT_PX / windowHeight) * PERCENT_MULTIPLIER,
    };
  }
}

/**
 * Вычисляет размеры на основе скролла
 * @param {number} scrollY - Позиция скролла
 * @param {number} viewportHeight - Высота viewport
 * @param {boolean} useAggressiveProgress - Использовать агрессивное вычисление прогресса
 * @returns {object} - Объект с targetWidth и targetHeight
 */
export function calculateSizesFromScroll(scrollY, viewportHeight, useAggressiveProgress = false) {
  const currentMinSizes = getMinSizes();
  const scrollProgress = useAggressiveProgress
    ? Math.min(scrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER), SCROLL_PROGRESS_MAX)
    : Math.min(scrollY / viewportHeight, SCROLL_PROGRESS_MAX);
  const stepPercent = Math.min(scrollProgress, SCROLL_PROGRESS_MAX);

  const widthRange = MAX_WIDTH - currentMinSizes.width;
  const heightRange = MAX_HEIGHT - currentMinSizes.height;
  let targetWidth = currentMinSizes.width + widthRange * stepPercent;
  let targetHeight = currentMinSizes.height + heightRange * stepPercent;

  // Ограничиваем минимальными и максимальными значениями
  targetWidth = Math.max(targetWidth, currentMinSizes.width);
  targetWidth = Math.min(targetWidth, MAX_WIDTH);
  targetHeight = Math.max(targetHeight, currentMinSizes.height);
  targetHeight = Math.min(targetHeight, MAX_HEIGHT);

  return { targetWidth, targetHeight };
}
