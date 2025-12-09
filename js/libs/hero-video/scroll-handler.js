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
  TABLET_MIN_WIDTH,
} from './constants.js';
import { checkIsDesktop, getMinSizes } from './video-utils.js';

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
 * Проверяет, является ли разрешение 768px и ниже
 * @returns {boolean}
 */
const checkIsMobileOrTablet = () => {
  return getViewportWidth() <= TABLET_MIN_WIDTH;
};

/**
 * Вычисляет начальное и конечное значение top и height для мобильных/планшетов
 * @returns {object} - Объект с initialTop, finalTop, initialHeight и finalHeight
 */
export const getMobileTopValues = () => {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем значения для мобильных
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= 375.5) {
    return {
      initialTop: 178,
      finalTop: 120,
      initialHeight: 135,
      finalHeight: 235,
      initialWidth: 225,
      finalWidth: 345,
    };
  } else if (windowWidth <= 768) {
    const widthFrom = 768;
    const widthTo = 375;

    // Интерполируем initialTop от 240px (768px) до 178px (375px)
    const topStartSize = 240; // значение на 768px
    const topMinSize = 178; // значение на 375px
    const initialTop = Math.round(topMinSize + (topStartSize - topMinSize) * (windowWidth - widthTo) / (widthFrom - widthTo));

    // Интерполируем finalTop от 136px (768px) до 120px (375px)
    const finalTopStartSize = 136;
    const finalTopMinSize = 120;
    const finalTop = Math.round(finalTopMinSize + (finalTopStartSize - finalTopMinSize) * (windowWidth - widthTo) / (widthFrom - widthTo));

    // Интерполируем initialHeight от 226px (768px) до 135px (375px)
    const heightStartSize = 226; // значение на 768px
    const heightMinSize = 135; // значение на 375px
    const initialHeight = Math.round(heightMinSize + (heightStartSize - heightMinSize) * (windowWidth - widthTo) / (widthFrom - widthTo));

    // Интерполируем finalHeight от 442px (768px) до 235px (375px)
    const finalHeightStartSize = 442; // значение на 768px
    const finalHeightMinSize = 235; // значение на 375px
    const finalHeight = Math.round(finalHeightMinSize + (finalHeightStartSize - finalHeightMinSize) * (windowWidth - widthTo) / (widthFrom - widthTo));

    return {
      initialTop,
      finalTop,
      initialHeight,
      finalHeight,
    };
  }

  return null;
};

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
    const isDesktop = checkIsDesktop();
    const isMobileOrTablet = checkIsMobileOrTablet();

    // Обработка для мобильных и планшетов (768px и ниже)
    if (isMobileOrTablet) {
      const topValues = getMobileTopValues();

      if (topValues) {
        // Используем более агрессивное вычисление прогресса для быстрого раскрытия
        const scrollProgress = Math.min(
          currentScrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER),
          SCROLL_PROGRESS_MAX,
        );

        // Вычисляем процент прогресса от 0 до 1
        const progress = Math.min(scrollProgress, SCROLL_PROGRESS_MAX);

        // Округляем progress до шагов для предотвращения частых перезапусков анимации
        // Используем 200 шагов для более плавной анимации
        const progressStep = Math.floor(progress * 200) / 200;
        const lastProgressStep = state.mobileProgressStep !== undefined ? state.mobileProgressStep : -1;

        // Запускаем анимацию только если прогресс изменился достаточно
        if (progressStep !== lastProgressStep) {
          setState({ mobileProgressStep: progressStep });

          // Интерполируем top от начального до конечного значения
          const topRange = topValues.initialTop - topValues.finalTop;
          const targetTop = topValues.initialTop - (topRange * progress);

          // Интерполируем height от начального до конечного значения
          const heightRange = topValues.finalHeight - topValues.initialHeight;
          const targetHeight = topValues.initialHeight + (heightRange * progress);

          // Ширина изменяется при скролле, но видео всегда центрировано
          // Плавно интерполируем ширину, избегая резких переключений на 'auto'
          let targetWidth;
          if (topValues.initialWidth && topValues.finalWidth) {
            // Для 375px используем конкретные значения ширины
            // Интерполируем от initialWidth до finalWidth плавно
            const widthRange = topValues.finalWidth - topValues.initialWidth;
            const targetWidthValue = topValues.initialWidth + (widthRange * progress);
            targetWidth = `${targetWidthValue}px`;
          } else {
            // Для других разрешений интерполируем от min-width до 100% viewport
            // Получаем текущее min-width из computed styles для точности
            const computedStyle = window.getComputedStyle(heroVideo);
            const minWidth = parseFloat(computedStyle.minWidth) || 416; // fallback для 768px
            const viewportWidth = getViewportWidth();

            // Интерполируем от minWidth до viewportWidth (100%)
            const widthRange = viewportWidth - minWidth;
            const targetWidthValue = minWidth + (widthRange * progress);
            targetWidth = `${targetWidthValue}px`;
          }

          if (state.currentAnimation) {
            state.currentAnimation.kill();
          }

          const animationProps = {
            '--video-top': `${targetTop}px`,
            '--video-height': `${targetHeight}px`,
            '--video-width': targetWidth,
            'duration': ANIMATION_DURATION_NORMAL,
            'ease': EASE_TYPE,
            'onComplete': () => {
              setState({ currentAnimation: null });
            },
          };

          const newAnimation = gsap.to(heroVideo, animationProps);

          setState({ currentAnimation: newAnimation });
        }
      }

      lastScrollY = currentScrollY;
      return;
    }

    // Обработка для десктопа
    if (!isDesktop) {
      return;
    }

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
