import Swiper from 'swiper';
import 'swiper/css';

// Константы для размеров экрана
const MOBILE_BREAKPOINT = 768;

// Константы для настройки Swiper
const SWIPER_SPACE_BETWEEN = 10;
const SWIPER_SPEED = 800;

// Константы для обработки событий
const RESIZE_DEBOUNCE_DELAY = 250;

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioSliders);
} else {
  initPortfolioSliders();
}

// Обработка изменения размера окна с debounce
let resizeTimer = null;
window.addEventListener('resize', () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(handleResize, RESIZE_DEBOUNCE_DELAY);
});

// Экспорт для возможности ручного управления
export { destroyPortfolioSliders, initPortfolioSliders };
