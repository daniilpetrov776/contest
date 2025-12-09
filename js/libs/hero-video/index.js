import { gsap } from 'gsap';
import { createOptimizedScrollHandler, createDebouncedResizeHandler, initOnDOMReady } from '../animation-utils.js';
import {
  RESIZE_DEBOUNCE_DELAY,
  ANIMATION_DURATION_RESIZE,
  KEY_ENTER,
  KEY_SPACE,
} from './constants.js';
import {
  checkIsDesktop,
  calculateSizesFromScroll,
  getViewportWidth,
  getInitialMobileTop,
  getInitialMobileHeight,
  checkIsMobileOrTablet,
  createVideoAnimation,
} from './video-utils.js';
import { initVideoAccessibility, handleVideoClick, updateAriaLabel } from './video-controls.js';
import { createScrollHandler, getMobileTopValues } from './scroll-handler.js';


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
  const isMobileOrTablet = checkIsMobileOrTablet();

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

  // Обработчик нажатия клавиши (только для Enter и пробела)
  const handleKeydown = (e) => {
    // Обрабатываем только Enter и пробел - явные действия пользователя
    if (e.key === KEY_ENTER || e.key === KEY_SPACE) {
      handleVideoClick(e, heroVideo, mutedVideo, soundVideo, state, setState);
      // Обновляем aria-label после изменения состояния
      updateAriaLabel(heroVideo, state.isExpanded, state.isPlayingWithSound);
    }
  };

  // Обработчик фокуса - предотвращаем автоматическое воспроизведение при табуляции
  const handleFocus = () => {
    // При фокусе на элементе видео не должно происходить автоматическое воспроизведение
    // Видео должно воспроизводиться только при явном действии (клик или Enter/пробел)
    // Убеждаемся, что видео со звуком не воспроизводится автоматически при получении фокуса
    // Если видео случайно начало воспроизводиться при фокусе (не по нашему коду) - останавливаем его
    if (soundVideo && !soundVideo.paused && !state.isPlayingWithSound) {
      soundVideo.pause();
    }
  };

  // Добавляем обработчики событий
  heroVideo.addEventListener('click', handleClick);
  heroVideo.addEventListener('keydown', handleKeydown);
  heroVideo.addEventListener('focus', handleFocus);
  mutedVideo.addEventListener('click', handleClick);
  soundVideo.addEventListener('click', handleClick);

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  createOptimizedScrollHandler(handleScroll);

  // Обработчик изменения размера окна для пересчета минимальных размеров
  createDebouncedResizeHandler(() => {
    const isDesktopResize = checkIsDesktop();
    const isMobileOrTabletResize = checkIsMobileOrTablet();

    // Обработка для десктопа
    if (isDesktopResize) {
    // Если видео не увеличено, обновляем размер на основе текущего скролла
      if (!state.isExpanded) {
        const { targetWidth, targetHeight } = calculateSizesFromScroll(
          window.scrollY,
          window.innerHeight,
        );

        createVideoAnimation(
          heroVideo,
          {
            '--video-width': `${targetWidth}%`,
            '--video-height': `${targetHeight}%`,
          },
          ANIMATION_DURATION_RESIZE,
          setState,
          state.currentAnimation,
        );
      }
    }

    // Обработка для мобильных/планшетов - обновляем значения в пикселях
    if (isMobileOrTabletResize) {
      if (state.isExpanded) {
        // Если видео расширено - обновляем финальные размеры в пикселях
        const topValues = getMobileTopValues();
        if (topValues) {
          const viewportWidth = getViewportWidth();
          const finalSizes = {
            width: viewportWidth,
            height: topValues.finalHeight,
          };

          gsap.set(heroVideo, {
            '--video-top': `${topValues.finalTop}px`,
            '--video-height': `${finalSizes.height}px`,
            '--video-width': `${finalSizes.width}px`,
          });
        }
      } else {
        // Если не расширено - обновляем начальные значения в пикселях
        const initialTop = getInitialMobileTop();
        const initialHeight = getInitialMobileHeight();
        if (initialTop !== null && initialHeight !== null) {
          gsap.set(heroVideo, {
            '--video-top': `${initialTop}px`,
            '--video-height': `${initialHeight}px`,
            '--video-width': 'auto',
          });
        }
      }
    }
  }, RESIZE_DEBOUNCE_DELAY);
}

// Запускаем инициализацию после загрузки DOM
initOnDOMReady(initHeroVideo);
