import { gsap } from 'gsap';
import { EASE_TYPE } from '../animation-constants.js';
import {
  DESKTOP_MIN_WIDTH,
  TABLET_MIN_WIDTH,
  MOBILE_MAX_WIDTH_THRESHOLD,
  MOBILE_MAX_WIDTH,
  MOBILE_INITIAL_TOP,
  MOBILE_INITIAL_HEIGHT,
  TABLET_INITIAL_TOP,
  TABLET_INITIAL_HEIGHT,
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
export function getViewportWidth() {
  // Используем visualViewport если доступен (более точный для эмуляторов)
  if (window.visualViewport && window.visualViewport.width) {
    return window.visualViewport.width;
  }
  // Иначе используем clientWidth, который более точно отражает размер viewport
  return document.documentElement.clientWidth || window.innerWidth;
}

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

/**
 * Интерполирует значение между двумя точками на основе текущей ширины
 * @param {number} startSize - Начальное значение (при widthFrom)
 * @param {number} minSize - Конечное значение (при widthTo)
 * @param {number} widthFrom - Ширина, при которой значение равно startSize
 * @param {number} widthTo - Ширина, при которой значение равно minSize
 * @param {number} currentWidth - Текущая ширина для интерполяции
 * @returns {number} - Интерполированное значение, округленное до целого
 */
export function interpolateValue(startSize, minSize, widthFrom, widthTo, currentWidth) {
  const value = minSize + (startSize - minSize) * (currentWidth - widthTo) / (widthFrom - widthTo);
  return Math.round(value);
}

/**
 * Получает начальное значение top для мобильных/планшетов с интерполяцией
 * Интерполирует от 240px (768px) до 178px (375px) по аналогии с adaptive-value
 * @returns {number|null}
 */
export function getInitialMobileTop() {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем 178px
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= MOBILE_MAX_WIDTH_THRESHOLD) {
    return MOBILE_INITIAL_TOP;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполяция от 240px (768px) до 178px (375px)
    return interpolateValue(
      TABLET_INITIAL_TOP,
      MOBILE_INITIAL_TOP,
      TABLET_MIN_WIDTH,
      MOBILE_MAX_WIDTH,
      windowWidth,
    );
  }

  return null;
}

/**
 * Получает начальное значение height для мобильных/планшетов
 * @returns {number|null}
 */
export function getInitialMobileHeight() {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем 135px
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= MOBILE_MAX_WIDTH_THRESHOLD) {
    return MOBILE_INITIAL_HEIGHT;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполируем от 226px (768px) до 135px (375px)
    return interpolateValue(
      TABLET_INITIAL_HEIGHT,
      MOBILE_INITIAL_HEIGHT,
      TABLET_MIN_WIDTH,
      MOBILE_MAX_WIDTH,
      windowWidth,
    );
  }

  return null;
}

/**
 * Проверяет, является ли разрешение 768px и ниже
 * @returns {boolean}
 */
export function checkIsMobileOrTablet() {
  return getViewportWidth() <= TABLET_MIN_WIDTH;
}

/**
 * Создает GSAP анимацию для видео с автоматическим управлением предыдущей анимацией
 * @param {HTMLElement} heroVideo - Элемент видео
 * @param {object} props - Объект с CSS переменными для анимации
 * @param {number} duration - Длительность анимации
 * @param {Function} setState - Функция для обновления состояния
 * @param {object|null} currentAnimation - Текущая анимация (если есть)
 * @returns {object} - Созданная GSAP анимация
 */
export function createVideoAnimation(heroVideo, props, duration, setState, currentAnimation = null) {
  // Убиваем предыдущую анимацию, если она существует
  if (currentAnimation) {
    currentAnimation.kill();
  }

  // Создаем новую анимацию
  const newAnimation = gsap.to(heroVideo, {
    ...props,
    duration,
    ease: EASE_TYPE,
    onComplete: () => {
      setState({ currentAnimation: null });
    },
  });

  // Обновляем состояние
  setState({ currentAnimation: newAnimation });

  return newAnimation;
}
