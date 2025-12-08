import Swiper from 'swiper';
import 'swiper/css';
import { RESIZE_DEBOUNCE_DELAY } from './animation-constants.js';
import { initOnDOMReady, createDebouncedResizeHandler } from './animation-utils.js';

// Константы для размеров экрана
const MOBILE_BREAKPOINT = 768;

// Константы для настройки Swiper
const SWIPER_SPACE_BETWEEN = 10;
const SWIPER_SPEED = 800;

const portfolioSwipers = new Map();

function initPortfolioSliders() {
  const categories = document.querySelectorAll('.portfolio__category.swiper');

  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    destroyPortfolioSliders();
    return;
  }

  if (!categories || categories.length === 0) {
    return;
  }

  categories.forEach((category) => {
    // Если свайпер уже инициализирован для этого элемента, пропускаем
    if (portfolioSwipers.has(category)) {
      return;
    }

    const swiper = new Swiper(category, {
      slidesPerView: 'auto',
      spaceBetween: SWIPER_SPACE_BETWEEN,
      speed: SWIPER_SPEED,
      observer: true,
      observeParents: true,
    });

    portfolioSwipers.set(category, swiper);
  });
}

function destroyPortfolioSliders() {
  portfolioSwipers.forEach((swiper, element) => {
    swiper.destroy(true, true);
    portfolioSwipers.delete(element);
  });
}

function handleResize() {
  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    destroyPortfolioSliders();
  } else {
    initPortfolioSliders();
  }
}

initOnDOMReady(initPortfolioSliders);

// Обработка изменения размера окна с debounce
createDebouncedResizeHandler(handleResize, RESIZE_DEBOUNCE_DELAY);

// Экспорт для возможности ручного управления
export { destroyPortfolioSliders, initPortfolioSliders };
