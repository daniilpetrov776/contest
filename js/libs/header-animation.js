import { gsap } from 'gsap';
import { EASE_TYPE } from './animation-constants.js';
import { createOptimizedScrollHandler, initOnDOMReady } from './animation-utils.js';

// Константы для размеров экрана
const HEADER_ANIMATION_SCREEN_WIDTH = 1280;

// Константы для начального состояния
const INITIAL_BEFORE_WIDTH = 0;
const FINAL_BEFORE_WIDTH = 100;

// Константы для анимации при загрузке
const LOAD_ANIMATION_DELAY = 0.3;
const LOAD_ANIMATION_DURATION = 2;

// Константы для анимации при скролле
const SCROLL_ANIMATION_DURATION = 0.3;
const HEADER_HIDE_POSITION = -100;
const HEADER_SHOW_POSITION = 0;
const SCROLL_POSITION_THRESHOLD = 0;

function initHeaderAnimation() {
  const header = document.querySelector('.header');

  if (!header) {
    return;
  }

  // Устанавливаем начальное состояние псевдоэлемента
  gsap.set(header, {
    '--before-width': `${INITIAL_BEFORE_WIDTH}%`,
  });

  // Анимация при загрузке
  const timeline = gsap.timeline({
    delay: LOAD_ANIMATION_DELAY,
  });

  // Анимация ::before - расширение до 100% в обе стороны с центра
  timeline.to(header, {
    '--before-width': `${FINAL_BEFORE_WIDTH}%`,
    'duration': LOAD_ANIMATION_DURATION,
    'ease': EASE_TYPE,
  });

  // Обработчик скролла для скрытия/показа хедера только на десктопе
  let lastScrollY = window.scrollY;
  let isAnimating = false;
  let isHeaderVisible = true;

  const handleScroll = () => {
    const isDesktop = window.innerWidth >= HEADER_ANIMATION_SCREEN_WIDTH;

    if (!isDesktop) {
      return;
    }

    const currentScrollY = window.scrollY;

    // Пропускаем обработку, если скролл не изменился
    if (currentScrollY === lastScrollY) {
      return;
    }

    // Определяем направление скролла
    const isScrollingDown = currentScrollY > lastScrollY;
    const shouldHide = isScrollingDown && currentScrollY > SCROLL_POSITION_THRESHOLD;
    const shouldShow = !isScrollingDown || currentScrollY === SCROLL_POSITION_THRESHOLD;

    // Анимируем только если нужно изменить состояние
    if ((shouldHide && isHeaderVisible) || (shouldShow && !isHeaderVisible)) {
      if (!isAnimating) {
        isAnimating = true;

        const targetY = shouldHide ? `${HEADER_HIDE_POSITION}%` : `${HEADER_SHOW_POSITION}%`;

        gsap.to(header, {
          y: targetY,
          duration: SCROLL_ANIMATION_DURATION,
          ease: EASE_TYPE,
          onComplete: () => {
            isAnimating = false;
            isHeaderVisible = !shouldHide;
          },
        });
      }
    }

    lastScrollY = currentScrollY;
  };

  // Добавляем обработчик скролла с оптимизацией через requestAnimationFrame
  createOptimizedScrollHandler(handleScroll);
}

// Запускаем анимацию после загрузки DOM
initOnDOMReady(initHeaderAnimation);
