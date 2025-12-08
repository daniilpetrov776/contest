import { gsap } from 'gsap';
import { EASE_TYPE } from '../animation-constants.js';
import { createOptimizedScrollHandler, createDebouncedResizeHandler, initOnDOMReady } from '../animation-utils.js';
import { RESIZE_DEBOUNCE_DELAY, ANIMATION_DURATION_RESIZE } from './constants.js';
import { checkIsDesktop, calculateSizesFromScroll } from './video-utils.js';
import { initVideoAccessibility, handleVideoClick, updateAriaLabel } from './video-controls.js';
import { createScrollHandler } from './scroll-handler.js';

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
  };

  // Функция для обновления состояния
  const setState = (updates) => {
    state = { ...state, ...updates };
  };

  const isDesktop = checkIsDesktop();

  // Устанавливаем начальные размеры только на десктопе
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
    // Работает только на десктопе
    if (!checkIsDesktop()) {
      return;
    }

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
  }, RESIZE_DEBOUNCE_DELAY);
}

// Запускаем инициализацию после загрузки DOM
initOnDOMReady(initHeroVideo);
