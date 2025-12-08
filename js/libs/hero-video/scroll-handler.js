import { gsap } from 'gsap';
import { EASE_TYPE } from '../animation-constants.js';
import {
  STEP_SIZE,
  ANIMATION_DURATION_NORMAL,
  MAX_STEP_CALCULATION,
  SCROLL_PROGRESS_MULTIPLIER,
  SCROLL_PROGRESS_MAX,
  MAX_WIDTH,
  MAX_HEIGHT,
} from './constants.js';
import { checkIsDesktop, getMinSizes } from './video-utils.js';

/**
 * Создает обработчик скролла для изменения размера видео
 * @param {HTMLElement} heroVideo - Элемент видео
 * @param {Function} getIsExpanded - Функция получения состояния isExpanded
 * @param {Function} getState - Функция получения состояния
 * @param {Function} setState - Функция для обновления состояния
 * @returns {Function} - Обработчик скролла
 */
export function createScrollHandler(heroVideo, getIsExpanded, getState, setState) {
  let lastScrollY = window.scrollY;
  const MAX_STEP = Math.ceil(MAX_STEP_CALCULATION / STEP_SIZE);

  return () => {
    // Работает только на десктопе
    if (!checkIsDesktop()) {
      return;
    }

    // Если видео увеличено при клике - не обрабатываем скролл
    if (getIsExpanded()) {
      return;
    }

    const state = getState();

    const currentScrollY = window.scrollY;

    if (currentScrollY === lastScrollY) {
      return;
    }

    const viewportHeight = window.innerHeight;
    // Используем более агрессивное вычисление прогресса для быстрого раскрытия
    const scrollProgress = Math.min(
      currentScrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER),
      SCROLL_PROGRESS_MAX,
    );
    const newStep = Math.floor(scrollProgress * MAX_STEP);
    const clampedStep = Math.min(newStep, MAX_STEP);

    if (clampedStep !== state.currentStep) {
      setState({ currentStep: clampedStep });

      // Вычисляем процент прогресса от 0 до 1
      const stepPercent = clampedStep / MAX_STEP;
      const currentMinSizes = getMinSizes();
      const widthRange = MAX_WIDTH - currentMinSizes.width;
      const heightRange = MAX_HEIGHT - currentMinSizes.height;
      let targetWidth = currentMinSizes.width + widthRange * stepPercent;
      let targetHeight = currentMinSizes.height + heightRange * stepPercent;

      // Ограничиваем минимальными и максимальными значениями
      targetWidth = Math.max(targetWidth, currentMinSizes.width);
      targetWidth = Math.min(targetWidth, MAX_WIDTH);
      targetHeight = Math.max(targetHeight, currentMinSizes.height);
      targetHeight = Math.min(targetHeight, MAX_HEIGHT);

      if (state.currentAnimation) {
        state.currentAnimation.kill();
      }

      const newAnimation = gsap.to(heroVideo, {
        '--video-width': `${targetWidth}%`,
        '--video-height': `${targetHeight}%`,
        'duration': ANIMATION_DURATION_NORMAL,
        'ease': EASE_TYPE,
        'onComplete': () => {
          setState({ currentAnimation: null });
        },
      });

      setState({ currentAnimation: newAnimation });
    }

    lastScrollY = currentScrollY;
  };
}
