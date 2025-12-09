import {
  STEP_SIZE,
  ANIMATION_DURATION_NORMAL,
  MAX_STEP_CALCULATION,
  SCROLL_PROGRESS_MULTIPLIER,
  SCROLL_PROGRESS_MAX,
  MAX_WIDTH,
  MAX_HEIGHT,
  TABLET_MIN_WIDTH,
  MOBILE_MAX_WIDTH_THRESHOLD,
  MOBILE_MAX_WIDTH,
  MOBILE_INITIAL_TOP,
  MOBILE_INITIAL_HEIGHT,
  MOBILE_FINAL_TOP,
  MOBILE_FINAL_HEIGHT,
  MOBILE_FINAL_WIDTH,
  MOBILE_WIDTH_PX,
  TABLET_INITIAL_TOP,
  TABLET_INITIAL_HEIGHT,
  TABLET_FINAL_TOP,
  TABLET_FINAL_HEIGHT,
  TABLET_WIDTH_PX,
  MOBILE_PROGRESS_STEPS,
} from './constants.js';
import {
  checkIsDesktop,
  getMinSizes,
  getViewportWidth,
  checkIsMobileOrTablet,
  interpolateValue,
  createVideoAnimation,
} from './video-utils.js';


/**
 * Вычисляет начальное и конечное значение top и height для мобильных/планшетов
 * @returns {object} - Объект с initialTop, finalTop, initialHeight и finalHeight
 */
export const getMobileTopValues = () => {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем значения для мобильных
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= MOBILE_MAX_WIDTH_THRESHOLD) {
    return {
      initialTop: MOBILE_INITIAL_TOP,
      finalTop: MOBILE_FINAL_TOP,
      initialHeight: MOBILE_INITIAL_HEIGHT,
      finalHeight: MOBILE_FINAL_HEIGHT,
      initialWidth: MOBILE_WIDTH_PX,
      finalWidth: MOBILE_FINAL_WIDTH,
    };
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    const widthFrom = TABLET_MIN_WIDTH;
    const widthTo = MOBILE_MAX_WIDTH;

    // Интерполируем initialTop от 240px (768px) до 178px (375px)
    const initialTop = interpolateValue(
      TABLET_INITIAL_TOP,
      MOBILE_INITIAL_TOP,
      widthFrom,
      widthTo,
      windowWidth,
    );

    // Интерполируем finalTop от 136px (768px) до 120px (375px)
    const finalTop = interpolateValue(
      TABLET_FINAL_TOP,
      MOBILE_FINAL_TOP,
      widthFrom,
      widthTo,
      windowWidth,
    );

    // Интерполируем initialHeight от 226px (768px) до 135px (375px)
    const initialHeight = interpolateValue(
      TABLET_INITIAL_HEIGHT,
      MOBILE_INITIAL_HEIGHT,
      widthFrom,
      widthTo,
      windowWidth,
    );

    // Интерполируем finalHeight от 442px (768px) до 235px (375px)
    const finalHeight = interpolateValue(
      TABLET_FINAL_HEIGHT,
      MOBILE_FINAL_HEIGHT,
      widthFrom,
      widthTo,
      windowWidth,
    );

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
        const mobileScrollProgress = Math.min(
          currentScrollY / (viewportHeight * SCROLL_PROGRESS_MULTIPLIER),
          SCROLL_PROGRESS_MAX,
        );

        // Вычисляем процент прогресса от 0 до 1
        const progress = Math.min(mobileScrollProgress, SCROLL_PROGRESS_MAX);

        // Округляем progress до шагов для предотвращения частых перезапусков анимации
        // Используем 200 шагов для более плавной анимации
        const progressStep = Math.floor(progress * MOBILE_PROGRESS_STEPS) / MOBILE_PROGRESS_STEPS;
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
            const minWidth = parseFloat(computedStyle.minWidth) || TABLET_WIDTH_PX; // fallback для 768px
            const viewportWidth = getViewportWidth();

            // Интерполируем от minWidth до viewportWidth (100%)
            const widthRange = viewportWidth - minWidth;
            const targetWidthValue = minWidth + (widthRange * progress);
            targetWidth = `${targetWidthValue}px`;
          }

          createVideoAnimation(
            heroVideo,
            {
              '--video-top': `${targetTop}px`,
              '--video-height': `${targetHeight}px`,
              '--video-width': targetWidth,
            },
            ANIMATION_DURATION_NORMAL,
            setState,
            state.currentAnimation,
          );
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

      createVideoAnimation(
        heroVideo,
        {
          '--video-width': `${targetWidth}%`,
          '--video-height': `${targetHeight}%`,
        },
        ANIMATION_DURATION_NORMAL,
        setState,
        state.currentAnimation,
      );
    }

    lastScrollY = currentScrollY;
  };
}
