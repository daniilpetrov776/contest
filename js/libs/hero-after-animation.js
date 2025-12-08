import { gsap } from 'gsap';
import { EASE_TYPE, RESIZE_DEBOUNCE_DELAY } from './animation-constants.js';
import { createOptimizedScrollHandler, createDebouncedResizeHandler, initOnDOMReady } from './animation-utils.js';

// Константы для размеров экрана
const TABLET_MIN_WIDTH = 768;
const TABLET_MAX_WIDTH = 1440;

// Константы для высоты псевдоэлемента
const INITIAL_HEIGHT_TABLET_PX = 120;
const INITIAL_HEIGHT_DESKTOP_PX = 130;
const MAX_HEIGHT_PERCENT = 50;
const INITIAL_HEIGHT_PERCENT = 0;
const PERCENT_MULTIPLIER = 100;

// Константы для анимации при загрузке
const LOAD_ANIMATION_DELAY = 0.3;
const LOAD_ANIMATION_DURATION = 2;

// Константы для анимации при скролле
const SCROLL_STEP_SIZE = 1;
const SCROLL_ANIMATION_DURATION = 1.6;
const SCROLL_PROGRESS_MAX = 1;
const MAX_STEP_CALCULATION = 100;

function initHeroAfterAnimation() {
  const hero = document.querySelector('.hero');

  if (!hero) {
    return;
  }

  // Устанавливаем начальное состояние псевдоэлемента
  gsap.set(hero, {
    '--after-height': `${INITIAL_HEIGHT_PERCENT}%`,
  });

  // Анимация при загрузке - вычисляем начальную высоту в процентах
  // Кэшируем высоту hero для избежания повторных чтений layout свойств
  let cachedHeroHeight = null;
  const getInitialHeightPercent = () => {
    // Кэшируем высоту при первом вызове
    if (cachedHeroHeight === null) {
      cachedHeroHeight = hero.offsetHeight;
    }
    const heroHeight = cachedHeroHeight;
    const isTablet = window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth < TABLET_MAX_WIDTH;
    const initialHeightPx = isTablet ? INITIAL_HEIGHT_TABLET_PX : INITIAL_HEIGHT_DESKTOP_PX;
    return (initialHeightPx / heroHeight) * PERCENT_MULTIPLIER;
  };

  const timeline = gsap.timeline({
    delay: LOAD_ANIMATION_DELAY,
  });

  // Анимация ::after - расширение до начальной высоты в процентах
  const initialHeightPercent = getInitialHeightPercent();

  timeline.to(hero, {
    '--after-height': `${initialHeightPercent}%`,
    'duration': LOAD_ANIMATION_DURATION,
    'ease': EASE_TYPE,
  });

  // Обработчик скролла для анимации ::after
  let lastScrollY = window.scrollY;
  let currentStep = 0;
  let currentAnimation = null;
  const maxStep = Math.ceil(MAX_STEP_CALCULATION / SCROLL_STEP_SIZE);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Пропускаем обработку, если скролл не изменился
    if (currentScrollY === lastScrollY) {
      return;
    }

    // Используем кэшированную высоту hero контейнера
    // Обновляем кэш только при изменении размера окна
    if (cachedHeroHeight === null) {
      cachedHeroHeight = hero.offsetHeight;
    }
    const heroHeight = cachedHeroHeight;

    // Получаем начальную высоту в процентах от контейнера
    const isTablet = window.innerWidth >= TABLET_MIN_WIDTH && window.innerWidth < TABLET_MAX_WIDTH;
    const initialHeightPx = isTablet ? INITIAL_HEIGHT_TABLET_PX : INITIAL_HEIGHT_DESKTOP_PX;
    const initialHeightPercent = (initialHeightPx / heroHeight) * PERCENT_MULTIPLIER;

    const maxHeightPercent = MAX_HEIGHT_PERCENT;

    // Вычисляем диапазон от начальной высоты до максимальной в процентах
    const heightRangePercent = maxHeightPercent - initialHeightPercent;

    // Вычисляем новый шаг на основе позиции скролла
    // Используем высоту окна как единицу измерения
    const viewportHeight = window.innerHeight;
    const scrollProgress = Math.min(currentScrollY / viewportHeight, SCROLL_PROGRESS_MAX);
    const newStep = Math.floor(scrollProgress * maxStep);

    // Ограничиваем шаг максимальным значением
    const clampedStep = Math.min(newStep, maxStep);

    // Вычисляем процент прогресса от 0 до 1
    const stepPercent = clampedStep / maxStep;

    // Вычисляем высоту в процентах: начальная + процент от диапазона
    const targetHeightPercent = initialHeightPercent + heightRangePercent * stepPercent;

    // Прерываем текущую анимацию, если она есть
    if (currentAnimation) {
      currentAnimation.kill();
    }

    // Анимируем только если значение изменилось
    if (clampedStep !== currentStep) {
      currentStep = clampedStep;

      // Анимируем от текущего значения до целевого (в процентах)
      currentAnimation = gsap.to(hero, {
        '--after-height': `${targetHeightPercent}%`,
        'duration': SCROLL_ANIMATION_DURATION,
        'ease': EASE_TYPE,
        'onComplete': () => {
          currentAnimation = null;
        },
      });
    }

    lastScrollY = currentScrollY;
  };

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  createOptimizedScrollHandler(handleScroll);

  // Обновляем кэш высоты при изменении размера окна
  createDebouncedResizeHandler(() => {
    cachedHeroHeight = hero.offsetHeight;
  }, RESIZE_DEBOUNCE_DELAY);
}

// Запускаем анимацию после загрузки DOM
initOnDOMReady(initHeroAfterAnimation);
