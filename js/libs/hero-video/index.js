import { gsap } from 'gsap';
import { EASE_TYPE } from '../animation-constants.js';
import { createOptimizedScrollHandler, createDebouncedResizeHandler, initOnDOMReady } from '../animation-utils.js';
import { RESIZE_DEBOUNCE_DELAY, ANIMATION_DURATION_RESIZE, TABLET_MIN_WIDTH } from './constants.js';
import { checkIsDesktop, calculateSizesFromScroll } from './video-utils.js';
import { initVideoAccessibility, handleVideoClick, updateAriaLabel } from './video-controls.js';
import { createScrollHandler } from './scroll-handler.js';

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
 * Получает начальное значение top для мобильных/планшетов с интерполяцией
 * Интерполирует от 240px (768px) до 178px (375px) по аналогии с adaptive-value
 * @returns {number|null}
 */
const getInitialMobileTop = () => {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем 178px
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= 375.5) {
    return 178;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполяция от 240px (768px) до 178px (375px)
    // Формула: value = minSize + (startSize - minSize) * (currentWidth - widthTo) / (widthFrom - widthTo)
    const startSize = 240; // значение на 768px
    const minSize = 178; // значение на 375px
    const widthFrom = 768;
    const widthTo = 375;

    const value = minSize + (startSize - minSize) * (windowWidth - widthTo) / (widthFrom - widthTo);
    return Math.round(value);
  }

  return null;
};

/**
 * Получает начальное значение height для мобильных/планшетов
 * @returns {number|null}
 */
const getInitialMobileHeight = () => {
  const windowWidth = getViewportWidth();

  // Для 375px и меньше используем 135px
  // Используем строгое сравнение с учетом возможных погрешностей
  if (windowWidth <= 375.5) {
    return 135;
  } else if (windowWidth <= TABLET_MIN_WIDTH) {
    // Интерполируем от 226px (768px) до 135px (375px)
    const startSize = 226; // значение на 768px
    const minSize = 135; // значение на 375px
    const widthFrom = 768;
    const widthTo = 375;

    const value = minSize + (startSize - minSize) * (windowWidth - widthTo) / (widthFrom - widthTo);
    return Math.round(value);
  }

  return null;
};

function initHeroVideo() {
  const heroVideo = document.querySelector('.hero__video');
  const mutedVideo = document.querySelector('.hero__video-element--muted');
  const soundVideo = document.querySelector('.hero__video-element--sound');

  if (!heroVideo || !mutedVideo || !soundVideo) {
    return;
  }

  // Состояние компонента
  let state = {
    isPlayingWithSound: false,
    isExpanded: false,
    currentAnimation: null,
    currentStep: 0,
    mobileProgressStep: undefined,
  };

  // Функция для обновления состояния
  const setState = (updates) => {
    state = { ...state, ...updates };
  };

  const isDesktop = checkIsDesktop();
  const isMobileOrTablet = getViewportWidth() <= TABLET_MIN_WIDTH;

  // Устанавливаем начальные размеры на десктопе
  if (isDesktop) {
    const { targetWidth, targetHeight } = calculateSizesFromScroll(
      window.scrollY,
      window.innerHeight,
    );

    // Устанавливаем начальные размеры через CSS переменные
    gsap.set(heroVideo, {
      '--video-width': `${targetWidth}%`,
      '--video-height': `${targetHeight}%`,
    });
  }

  // Устанавливаем начальные значения для мобильных/планшетов
  if (isMobileOrTablet) {
    const initialTop = getInitialMobileTop();
    const initialHeight = getInitialMobileHeight();
    if (initialTop !== null && initialHeight !== null) {
      // Устанавливаем значения синхронно через inline стили для гарантии применения
      // Это должно переопределить значения по умолчанию из CSS
      heroVideo.style.setProperty('--video-top', `${initialTop}px`);
      heroVideo.style.setProperty('--video-height', `${initialHeight}px`);
      heroVideo.style.setProperty('--video-width', 'auto');

      // Также устанавливаем через gsap для совместимости и анимаций
      gsap.set(heroVideo, {
        '--video-top': `${initialTop}px`,
        '--video-height': `${initialHeight}px`,
        '--video-width': 'auto',
      }, 0); // Устанавливаем без задержки
    }
  }

  // Инициализируем доступность
  initVideoAccessibility(heroVideo, mutedVideo, soundVideo, state.isExpanded, state.isPlayingWithSound);

  // Обработчик скролла для изменения размера видео
  const handleScroll = createScrollHandler(
    heroVideo,
    () => state.isExpanded,
    () => state,
    setState,
  );

  // Обработчик клика
  const handleClick = (e) => {
    handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
    // Обновляем aria-label после изменения состояния
    updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
  };

  // Обработчик нажатия клавиши
  const handleKeydown = (e) => {
    handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
    // Обновляем aria-label после изменения состояния
    updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
  };

  // Добавляем обработчики событий
  heroVideo.addEventListener('click', handleClick);
  heroVideo.addEventListener('keydown', handleKeydown);
  mutedVideo.addEventListener('click', handleClick);
  soundVideo.addEventListener('click', handleClick);

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  createOptimizedScrollHandler(handleScroll);

  // Обработчик изменения размера окна для пересчета минимальных размеров
  createDebouncedResizeHandler(() => {
    const isDesktop = checkIsDesktop();
    const isMobileOrTablet = getViewportWidth() <= TABLET_MIN_WIDTH;

    // Обработка для десктопа
    if (isDesktop) {
      // Если видео не увеличено, обновляем размер на основе текущего скролла
      if (!state.isExpanded) {
        const { targetWidth, targetHeight } = calculateSizesFromScroll(
          window.scrollY,
          window.innerHeight,
        );

        if (state.currentAnimation) {
          state.currentAnimation.kill();
        }

        const newAnimation = gsap.to(heroVideo, {
          '--video-width': `${targetWidth}%`,
          '--video-height': `${targetHeight}%`,
          'duration': ANIMATION_DURATION_RESIZE,
          'ease': EASE_TYPE,
          'onComplete': () => {
            setState({ currentAnimation: null });
          },
        });

        setState({ currentAnimation: newAnimation });
      }
    }

    // Обработка для мобильных/планшетов - обновляем начальные значения
    if (isMobileOrTablet) {
      const initialTop = getInitialMobileTop();
      const initialHeight = getInitialMobileHeight();
      if (initialTop !== null && initialHeight !== null && !state.isExpanded) {
        gsap.set(heroVideo, {
          '--video-top': `${initialTop}px`,
          '--video-height': `${initialHeight}px`,
          '--video-width': 'auto',
        });
      }
    }
  }, RESIZE_DEBOUNCE_DELAY);
}

// Запускаем инициализацию после загрузки DOM
initOnDOMReady(initHeroVideo);
